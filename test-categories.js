// Test script to check category API functionality
import { getCategories } from '../src/api/xano.js'

async function testCategories() {
  console.log('Testing category API...')
  
  try {
    const categories = await getCategories()
    console.log('✅ Categories loaded successfully:', categories)
  } catch (error) {
    console.error('❌ Error loading categories:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      data: error.data
    })
  }
}

testCategories()