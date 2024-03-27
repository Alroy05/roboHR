import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
    api: {
        bodyParser: false,
    }
};

export default async (req, res) => {
    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.status(500).json({ message: err.message });
                return;
            }

            try {
                const fileKeys = Object.keys(files);
                for (const key of fileKeys) {
                    const pdfFile = files[key];
                    const imagePath = pdfFile.path;
                    const pathToWriteImage = `data/resumes/${pdfFile.name}`;
                    const image = await fs.readFile(imagePath);
                    await fs.writeFile(pathToWriteImage, image);
                }

                res.status(200).json({ message: 'Files uploaded successfully!' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};