'use strict'

const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const Config = use('Config')
const Env = use('Env')
const SettingsService = use('App/Services/SettingsService')
const axios = require('axios')

// Adicione esta linha
global.Headers = require('node-fetch').Headers;

class LocalFilesService {
  constructor() {
    const supabaseConfig = Config.get('supabase')
    this.supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.key,
      { auth: { persistSession: false } }
    )
    this.settingsService = new SettingsService()
  }

  /**
   * Get bucket name from environment or default
   * @returns {string} Bucket name
   */
  getBucket() {
    return Env.get('SUPABASE_BUCKET', 'uploads')
  }

  /**
   * Download a photo from Supabase storage
   * @param {string} path - File path in storage
   * @returns {Promise<Buffer|null>} File buffer or null if error
   */
  async getPhoto(path) {
    try {
      // Get Supabase configuration
      const supabaseConfig = Config.get('supabase');

      // Construct the public URL manually
      const publicUrl = `${supabaseConfig.url}/storage/v1/object/public/${this.getBucket()}/${path}`;

      // Download the file using axios with a timeout
      const response = await axios({
        method: 'GET',
        url: publicUrl,
        responseType: 'arraybuffer',
        timeout: 10000, // 10 seconds timeout
        headers: {
          'apikey': supabaseConfig.key,
          'Authorization': `Bearer ${supabaseConfig.key}`
        }
      });

      if (!response.data) {
        console.error('No data received from Supabase storage');
        return null;
      }

      // Return the raw buffer
      return response.data;
    } catch (error) {
      console.error('Error downloading photo:', error)
      return null
    }
  }

  /**
   * List all files from specified folders
   * @returns {Promise<string[]>} Array of file paths
   */
  async listAllFiles() {
    const foldersToScan = ['uploads', 'thumbnails'] // Adicione aqui outras pastas se necessário
    const allFiles = []

    for (const folder of foldersToScan) {
      try {
        const { data, error } = await this.supabase.storage
          .from(this.getBucket())
          .list(folder, { limit: 1000 })

        if (error || !data) {
          console.error(`Erro ao listar arquivos da pasta ${folder}:`, error?.message)
          continue
        }

        const fileNames = data
          .filter((item) => item.name && !item.name.endsWith('/'))
          .map((item) => `${folder}/${item.name}`)

        allFiles.push(...fileNames)
      } catch (error) {
        console.error(`Error listing files from ${folder}:`, error)
      }
    }

    return allFiles
  }

  /**
   * Save photo to Supabase storage
   * @param {Object} file - File object (AdonisJS File object or object with buffer and originalname/clientName)
   * @param {Buffer} file.buffer - File buffer (if AdonisJS file, use file.tmpPath to read)
   * @param {string} file.originalname - Original file name (or file.clientName for AdonisJS)
   * @returns {Promise<{path: string, mimeType: string}>} Uploaded file info
   */
  async savePhoto(file) {
    const extension = 'jpg'
    // Support both AdonisJS File object and plain object
    const originalName = file.clientName || file.originalname || 'photo'
    const safeName = originalName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-')
    const filePath = `uploads/${Date.now()}-${safeName}.${extension}`

    try {
      // Get buffer from AdonisJS file or use provided buffer
      let fileBuffer
      if (file.tmpPath) {
        // AdonisJS file object - read from tmpPath
        const fs = require('fs')
        fileBuffer = fs.readFileSync(file.tmpPath)
      } else if (file.buffer) {
        // Plain buffer
        fileBuffer = file.buffer
      } else {
        throw new Error('File buffer not found')
      }

      // Convert to high-quality JPEG
      const jpegBuffer = await sharp(fileBuffer)
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 100, mozjpeg: true })
        .rotate() // auto-rotate based on EXIF
        .toBuffer()

      const { error } = await this.supabase.storage
        .from(this.getBucket())
        .upload(filePath, jpegBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      return { path: filePath, mimeType: 'image/jpeg' }
    } catch (error) {
      console.error('Error saving photo:', error)
      throw error
    }
  }

  /**
   * Create photo thumbnail
   * @param {Object} file - File object (AdonisJS File object or object with buffer and originalname/clientName)
   * @param {Buffer} file.buffer - File buffer (if AdonisJS file, use file.tmpPath to read)
   * @param {string} file.originalname - Original file name (or file.clientName for AdonisJS)
   * @returns {Promise<string>} Thumbnail path
   */
  async createPhotoThumbnail(file) {
    const extension = 'jpg' // Sempre jpg para a thumbnail
    // Support both AdonisJS File object and plain object
    const originalName = file.clientName || file.originalname || 'photo'
    const safeName = originalName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-')
    const thumbnailPath = `thumbnails/${Date.now()}-${safeName}-thumbnail.${extension}`

    try {
      // Get buffer from AdonisJS file or use provided buffer
      let fileBuffer
      if (file.tmpPath) {
        // AdonisJS file object - read from tmpPath
        const fs = require('fs')
        fileBuffer = fs.readFileSync(file.tmpPath)
      } else if (file.buffer) {
        // Plain buffer
        fileBuffer = file.buffer
      } else {
        throw new Error('File buffer not found')
      }

      // Get thumbnail size from settings
      const thumbnailSizeSetting = await this.settingsService.getSettingValueByName('Thumbnail size')
      const size = Math.abs(parseInt(thumbnailSizeSetting) || 200) // Default 200 if not found

      // Generate thumbnail with Sharp directly from memory
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: '#ffffff',
        })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer()

      const { error } = await this.supabase.storage
        .from(this.getBucket())
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw new Error(`Thumbnail upload failed: ${error.message}`)
      }

      return thumbnailPath
    } catch (error) {
      console.error('Error creating thumbnail:', error)
      throw error
    }
  }

  /**
   * Create photo placeholder (base64 encoded)
   * @param {Object} file - File object (AdonisJS File object or object with buffer and originalname/clientName)
   * @param {Buffer} file.buffer - File buffer (if AdonisJS file, use file.tmpPath to read)
   * @param {string} file.originalname - Original file name (or file.clientName for AdonisJS)
   * @returns {Promise<string>} Base64 data URL
   */
  async createPhotoPlaceholder(file) {
    try {
      // Support both AdonisJS File object and plain object
      const originalName = file.clientName || file.originalname || 'photo'
      let extension = originalName.split('.').pop() || 'png'
      const filePath = `originals/${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}.${extension}`

      // Download from Supabase (if exists)
      const { data, error } = await this.supabase.storage
        .from(this.getBucket())
        .download(filePath)

      if (error || !data) {
        // If file doesn't exist in Supabase, use the provided buffer
        let buffer
        if (file.tmpPath) {
          const fs = require('fs')
          buffer = fs.readFileSync(file.tmpPath)
        } else if (file.buffer) {
          buffer = file.buffer
        } else {
          throw new Error('File buffer not found')
        }
        return `data:image/png;base64,${buffer.toString('base64')}`
      }

      // Convert blob to buffer if needed
      const buffer = Buffer.from(await data.arrayBuffer())
      return `data:image/png;base64,${buffer.toString('base64')}`
    } catch (error) {
      console.error('Error creating placeholder:', error)
      // Fallback: use file buffer directly
      let buffer
      if (file.tmpPath) {
        const fs = require('fs')
        buffer = fs.readFileSync(file.tmpPath)
      } else if (file.buffer) {
        buffer = file.buffer
      } else {
        throw new Error('File buffer not found')
      }
      return `data:image/png;base64,${buffer.toString('base64')}`
    }
  }
}

module.exports = LocalFilesService

