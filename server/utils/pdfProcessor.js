import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import pdf2json from 'pdf2json';
import fs from 'fs';
import path from 'path';

class PDFProcessor {
  async extractTextFromPDF(buffer) {
    try {
      console.log('📄 Processing PDF buffer...');
      console.log('📊 Buffer size:', buffer.length, 'bytes');

      // Try multiple extraction methods
      let extractedText = '';

      // Method 1: pdf-parse
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text.trim();
        console.log('✅ pdf-parse extracted text length:', extractedText.length);

        if (extractedText.length > 50) {
          console.log('📄 First 200 chars:', extractedText.substring(0, 200));
          return this.cleanExtractedText(extractedText);
        }
      } catch (err) {
        console.error('❌ pdf-parse failed:', err);
      }

      // Method 2: pdf2json
      if (!extractedText || extractedText.length < 50) {
        console.log('🔄 Trying pdf2json...');
        try {
          extractedText = await this.extractWithPdf2json(buffer);
          console.log('✅ pdf2json extracted text length:', extractedText.length);

          if (extractedText.length > 50) {
            return this.cleanExtractedText(extractedText);
          }
        } catch (err) {
          console.error('❌ pdf2json failed:', err);
        }
      }

      // Method 3: OCR fallback
      if (!extractedText || extractedText.length < 50) {
        console.log('🔍 No sufficient text found, running OCR fallback...');
        extractedText = await this.extractTextWithOCR(buffer);
        console.log('✅ OCR extracted text length:', extractedText.length);
      }

      return this.cleanExtractedText(extractedText);
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      throw new Error('PDF processing failed: ' + error.message);
    }
  }

  async extractWithPdf2json(buffer) {
    return new Promise((resolve, reject) => {
      const pdfParser = new pdf2json();

      pdfParser.on('pdfParser_dataError', errData => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on('pdfParser_dataReady', pdfData => {
        try {
          let text = '';

          pdfData.Pages.forEach(page => {
            page.Texts.forEach(textItem => {
              textItem.R.forEach(run => {
                if (run.T) {
                  text += decodeURIComponent(run.T) + ' ';
                }
              });
            });
            text += '\n';
          });

          resolve(text.trim());
        } catch (err) {
          reject(err);
        }
      });

      pdfParser.parseBuffer(buffer);
    });
  }

  // Best-effort: try to find an embedded image and persist it to /uploads
  async extractFirstImageToFile(buffer) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const data = await new Promise((resolve, reject) => {
        const parser = new pdf2json();
        parser.on('pdfParser_dataError', err => reject(new Error(err.parserError)));
        parser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
        parser.parseBuffer(buffer);
      });

      const pageArray = Array.isArray(data?.Pages) ? data.Pages : [];
      const candidateKeys = ['Images', 'Image', 'Imgs', 'XObject', 'xObject'];

      for (const page of pageArray) {
        for (const key of candidateKeys) {
          const value = page?.[key];
          if (!value) continue;
          const imageArray = Array.isArray(value) ? value : (Array.isArray(value?.List) ? value.List : []);
          for (const img of imageArray) {
            const dataUri = img?.src || img?.dataURI || img?.DataURI || img?.dataUrl || img?.dataURL;
            if (typeof dataUri === 'string' && dataUri.startsWith('data:image/')) {
              const match = dataUri.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
              if (!match) continue;
              const ext = match[1].split('/')[1].toLowerCase();
              const base64 = match[2];
              const filename = `resume-photo-${Date.now()}.${ext}`;
              const filePath = path.join(uploadDir, filename);
              fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
              console.log('🖼️ Extracted embedded data-URI image from pdf2json');
              return `/uploads/${filename}`;
            }
          }
        }
      }
      // Fallback: scan PDF buffer for embedded JPEG/PNG/WEBP by magic bytes
      const tryMagic = this.extractEmbeddedImageByMagic(buffer, uploadDir);
      if (tryMagic) return tryMagic;
      return null;
    } catch (err) {
      console.warn('⚠️ No embedded image extracted from PDF:', err.message);
      return null;
    }
  }

  extractEmbeddedImageByMagic(buffer, uploadDir) {
    const candidates = [];
    // JPEG: FF D8 ... FF D9
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xD8) {
        for (let j = i + 2; j < buffer.length - 1; j++) {
          if (buffer[j] === 0xFF && buffer[j + 1] === 0xD9) {
            const size = j + 2 - i;
            if (size > 2 * 1024 && size < 10 * 1024 * 1024) {
              candidates.push({ start: i, end: j + 2, ext: 'jpg', size });
            }
            i = j + 1;
            break;
          }
        }
      }
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A ... IEND AE 42 60 82
    const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    for (let i = 0; i < buffer.length - pngSig.length; i++) {
      if (buffer.slice(i, i + pngSig.length).equals(pngSig)) {
        // search for IEND trailer
        for (let j = i + pngSig.length; j < buffer.length - 8; j++) {
          if (buffer[j] === 0x49 && buffer[j + 1] === 0x45 && buffer[j + 2] === 0x4E && buffer[j + 3] === 0x44 &&
            buffer[j + 4] === 0xAE && buffer[j + 5] === 0x42 && buffer[j + 6] === 0x60 && buffer[j + 7] === 0x82) {
            const size = j + 8 - i;
            if (size > 2 * 1024 && size < 10 * 1024 * 1024) {
              candidates.push({ start: i, end: j + 8, ext: 'png', size });
            }
            i = j + 7;
            break;
          }
        }
      }
    }
    // WEBP: RIFF xxxx WEBP
    const riff = Buffer.from('RIFF');
    const webp = Buffer.from('WEBP');
    for (let i = 0; i < buffer.length - 12; i++) {
      if (buffer.slice(i, i + 4).equals(riff) && buffer.slice(i + 8, i + 12).equals(webp)) {
        const sizeLE = buffer.readUInt32LE(i + 4); // size of RIFF chunk excluding 8 bytes
        const total = sizeLE + 8;
        const end = i + total;
        if (end <= buffer.length && total > 2 * 1024 && total < 10 * 1024 * 1024) {
          candidates.push({ start: i, end, ext: 'webp', size: total });
          i = end - 1;
        }
      }
    }

    if (candidates.length === 0) return null;
    // pick the largest sensible candidate (likely the headshot)
    candidates.sort((a, b) => b.size - a.size);
    const best = candidates[0];
    const filename = `resume-photo-${Date.now()}.${best.ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer.slice(best.start, best.end));
    console.log(`🖼️ Extracted embedded image by magic bytes: ${best.ext}, ${Math.round(best.size / 1024)}KB`);
    return `/uploads/${filename}`;
  }

  cleanExtractedText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/([0-9])([A-Z])/g, '$1 $2') // Add space between number and letter
      .trim();
  }

  async extractTextWithOCR(buffer) {
    try {
      // Convert buffer to base64 for tesseract.js
      const base64 = buffer.toString('base64');
      const image = `data:application/pdf;base64,${base64}`;

      const { data: { text } } = await Tesseract.recognize(image, 'eng', {
        logger: m => console.log('🔍 OCR:', m.status, m.progress),
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,-:@()[]{}|+-=_/\\#'
      });

      return text.trim();
    } catch (err) {
      console.error('❌ OCR extraction failed:', err);
      return '';
    }
  }
}

const pdfProcessor = new PDFProcessor();
export default pdfProcessor;
