import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApartments } from '../../context/ApartmentContext';
import type { HeatingType, DocumentType } from '../../types';
import './Admin.css';
import { Plus, Trash2, CheckCircle2, UploadCloud, ChevronLeft, ChevronRight, Save } from 'lucide-react';

type PreviewImage = {
  type: 'existing';
  id: number;
  url: string;
} | {
  type: 'new';
  file: File;
  previewUrl: string;
};

const Admin: React.FC = () => {
  const { apartments, addApartment, editApartment } = useApartments();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const editIdParam = searchParams.get('edit');
  const editId = editIdParam ? parseInt(editIdParam, 10) : null;
  const isEditing = editId !== null;

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    lat: '',
    lng: '',
    area: '',
    price: '',
    heating: 'CENTRAL' as HeatingType,
    floor: '',
    floor_total: '',
    document: 'TECHPASPORT' as DocumentType,
    additional_info: '',
    owner_phone: '',
  });

  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);

  useEffect(() => {
    if (isEditing && apartments.length > 0) {
      const aptToEdit = apartments.find(apt => apt.id === editId);
      if (aptToEdit) {
        setFormData({
          address: aptToEdit.address,
          lat: aptToEdit.lat?.toString() || '',
          lng: aptToEdit.lng?.toString() || '',
          area: aptToEdit.area.toString(),
          price: aptToEdit.price.toString(),
          heating: aptToEdit.heating,
          floor: aptToEdit.floor.toString(),
          floor_total: aptToEdit.floor_total.toString(),
          document: aptToEdit.document,
          additional_info: aptToEdit.additional_info || '',
          owner_phone: aptToEdit.owner_phone || '',
        });

        if (aptToEdit.images) {
          setPreviewImages(aptToEdit.images.map(img => ({
            type: 'existing',
            id: img.id,
            url: img.url
          })));
        } else {
          setPreviewImages([]);
        }
      }
    }
  }, [isEditing, editId, apartments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: PreviewImage[] = acceptedFiles.map(file => ({
      type: 'new',
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPreviewImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  const removeImage = (index: number) => {
    setPreviewImages(prev => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed.type === 'new') {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return newImages;
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setPreviewImages(prev => {
      const newImages = [...prev];
      if (direction === 'left' && index > 0) {
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      } else if (direction === 'right' && index < newImages.length - 1) {
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      }
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newFiles = previewImages.filter(img => img.type === 'new').map(img => (img as any).file);
    
    const imagesOrder = previewImages.map((img) => {
      if (img.type === 'existing') {
        return { type: 'existing', id: img.id };
      } else {
        const fileIndex = newFiles.indexOf(img.file);
        return { type: 'new', fileIndex };
      }
    });

    const apartmentData = {
      address: formData.address,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lng: formData.lng ? parseFloat(formData.lng) : undefined,
      area: parseFloat(formData.area),
      price: parseFloat(formData.price),
      heating: formData.heating,
      floor: parseInt(formData.floor, 10),
      floor_total: parseInt(formData.floor_total, 10),
      document: formData.document,
      additional_info: formData.additional_info,
      owner_phone: formData.owner_phone,
      imagesOrder: imagesOrder
    };

    const submitData = new FormData();
    submitData.append('apartmentData', JSON.stringify(apartmentData));
    
    newFiles.forEach(file => {
      submitData.append('images', file);
    });

    try {
      if (isEditing && editId !== null) {
        await editApartment(editId, submitData);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/');
        }, 1500);
      } else {
        await addApartment(submitData);
        setSuccess(true);
        
        // Reset form
        setFormData({
          address: '', lat: '', lng: '', area: '', price: '',
          heating: 'CENTRAL', floor: '', floor_total: '',
          document: 'TECHPASPORT', additional_info: '', owner_phone: ''
        });
        setPreviewImages([]);
        
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(isEditing ? 'Не удалось обновить квартиру' : 'Не удалось добавить квартиру');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{isEditing ? 'Редактировать квартиру' : 'Добавить новую квартиру'}</h1>
        <p className="subtitle">
          {isEditing ? 'Отредактируйте данные и обновите фотографии.' : 'Введите данные и перетащите файлы изображений ниже.'}
        </p>
      </div>

      {success && (
        <div className="success-banner glass">
          <CheckCircle2 className="icon-accent" />
          <span>{isEditing ? 'Квартира успешно обновлена!' : 'Квартира успешно добавлена!'}</span>
        </div>
      )}

      <form className="admin-form glass" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Адрес</label>
            <input required type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} placeholder="напр. пр. Чуй 120" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Телефон владельца</label>
            <input required type="text" name="owner_phone" className="form-input" value={formData.owner_phone} onChange={handleChange} placeholder="+996 555 000 000" />
          </div>

          <div className="form-group">
            <label className="form-label">Широта (Необязательно)</label>
            <input type="number" step="any" name="lat" className="form-input" value={formData.lat} onChange={handleChange} placeholder="42.8746" />
          </div>

          <div className="form-group">
            <label className="form-label">Долгота (Необязательно)</label>
            <input type="number" step="any" name="lng" className="form-input" value={formData.lng} onChange={handleChange} placeholder="74.5698" />
          </div>

          <div className="form-group">
            <label className="form-label">Цена ($)</label>
            <input required type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} placeholder="85000" />
          </div>

          <div className="form-group">
            <label className="form-label">Площадь (м²)</label>
            <input required type="number" step="0.1" name="area" className="form-input" value={formData.area} onChange={handleChange} placeholder="75.5" />
          </div>

          <div className="form-group">
            <label className="form-label">Этаж</label>
            <input required type="number" name="floor" className="form-input" value={formData.floor} onChange={handleChange} placeholder="4" />
          </div>

          <div className="form-group">
            <label className="form-label">Всего этажей</label>
            <input required type="number" name="floor_total" className="form-input" value={formData.floor_total} onChange={handleChange} placeholder="9" />
          </div>

          <div className="form-group">
            <label className="form-label">Отопление</label>
            <select name="heating" className="form-select" value={formData.heating} onChange={handleChange}>
              <option value="CENTRAL">Центральное</option>
              <option value="GAS">Газовое</option>
              <option value="ELECTRIC">Электрическое</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Тип документа</label>
            <select name="document" className="form-select" value={formData.document} onChange={handleChange}>
              <option value="TECHPASPORT">Техпаспорт</option>
              <option value="DDU">ДДУ</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Дополнительная информация</label>
          <textarea 
            name="additional_info" 
            className="form-input textarea" 
            value={formData.additional_info} 
            onChange={handleChange} 
            placeholder="Опишите квартиру..."
            rows={4}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Изображения (вы можете менять порядок стрелочками)</label>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <UploadCloud size={32} className="dropzone-icon" />
            {isDragActive ?
              <p>Бросайте изображения сюда ...</p> :
              <p>Перетащите сюда изображения или кликните для выбора файлов</p>
            }
          </div>
          
          {previewImages.length > 0 && (
            <div className="image-preview-grid">
              {previewImages.map((img, index) => (
                <div key={index} className="image-preview-card">
                  <img src={img.type === 'existing' ? img.url : img.previewUrl} alt={`preview-${index}`} className="preview-img" />
                  
                  <div className="preview-actions">
                    <button type="button" className="btn-preview-nav" onClick={() => moveImage(index, 'left')} disabled={index === 0}>
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="btn-preview-delete" onClick={() => removeImage(index)}>
                      <Trash2 size={16} />
                    </button>
                    <button type="button" className="btn-preview-nav" onClick={() => moveImage(index, 'right')} disabled={index === previewImages.length - 1}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Сохранение...' : isEditing ? <><Save size={20} /> Сохранить изменения</> : <><Plus size={20} /> Создать квартиру</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Admin;
