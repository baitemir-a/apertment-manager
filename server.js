import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public', 'media')));

// Setup storage
const mediaDir = path.join(__dirname, 'public', 'media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = [
    {
      id: 1,
      address: 'Chuy Ave 120, Bishkek',
      lat: 42.8765,
      lng: 74.6062,
      area: 75.5,
      price: 85000,
      heating: 'CENTRAL',
      floor: 4,
      floor_total: 9,
      document: 'TECHPASPORT',
      additional_info: 'Spacious apartment in the city center. Recently renovated.',
      owner_phone: '+996 555 123 456',
      images: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
          apartment_id: 1,
          description: 'Living Room'
        }
      ]
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Routes
app.get('/api/apartments', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/apartments', upload.array('images'), (req, res) => {
  try {
    const data = readData();
    const apartmentData = JSON.parse(req.body.apartmentData);
    
    // Find max ID
    const maxId = data.reduce((max, apt) => Math.max(max, apt.id), 0);
    const newId = maxId + 1;

    // Process images
    const images = (req.files || []).map((file, idx) => ({
      id: Date.now() + idx,
      url: `/media/${file.filename}`,
      apartment_id: newId
    }));

    const newApartment = {
      ...apartmentData,
      id: newId,
      images
    };

    data.push(newApartment);
    writeData(data);

    res.status(201).json(newApartment);
  } catch (error) {
    console.error('Error creating apartment:', error);
    res.status(500).json({ error: 'Failed to create apartment' });
  }
});

app.put('/api/apartments/:id', upload.array('images'), (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = readData();
    const aptIndex = data.findIndex(apt => apt.id === id);
    
    if (aptIndex === -1) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    const aptData = JSON.parse(req.body.apartmentData);
    const existingApartment = data[aptIndex];
    const newFiles = req.files || [];
    
    // Process images based on order provided by frontend
    const finalImages = [];
    if (aptData.imagesOrder) {
      aptData.imagesOrder.forEach(item => {
        if (item.type === 'existing') {
          // Find the existing image in the database
          const existingImage = existingApartment.images.find(img => img.id === item.id);
          if (existingImage) {
            finalImages.push(existingImage);
          }
        } else if (item.type === 'new') {
          // It's a newly uploaded file
          const file = newFiles[item.fileIndex];
          if (file) {
            finalImages.push({
              id: Date.now() + Math.random(),
              url: `/media/${file.filename}`,
              apartment_id: id
            });
          }
        }
      });
    }

    // Clean up aptData from imagesOrder before saving
    delete aptData.imagesOrder;

    data[aptIndex] = {
      ...existingApartment,
      ...aptData,
      id: id,
      images: finalImages
    };

    writeData(data);
    res.status(200).json(data[aptIndex]);
  } catch (error) {
    console.error('Error updating apartment:', error);
    res.status(500).json({ error: 'Failed to update apartment' });
  }
});

app.delete('/api/apartments/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = readData();
    const newData = data.filter(apt => apt.id !== id);
    writeData(newData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    res.status(500).json({ error: 'Failed to delete apartment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
