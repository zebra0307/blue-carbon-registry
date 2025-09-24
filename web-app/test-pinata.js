const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Your Pinata credentials
const PINATA_API_KEY = '4405670e8997ff3a0363';
const PINATA_SECRET_API_KEY = 'f230f21e227b16513a86fe35d1934da9f4832a913165b3133a69234f4a75c8f7';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwYmExNDYwYy1kZjM4LTQyZjEtYjBlZS0zMGVjMDVjOGQ1ZWQiLCJlbWFpbCI6InlzYXR5ZW5kcmEwMzA3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0NDA1NjcwZTg5OTdmZjNhMDM2MyIsInNjb3BlZEtleVNlY3JldCI6ImYyMzBmMjFlMjI3YjE2NTEzYTg2ZmUzNWQxOTM0ZGE5ZjQ4MzJhOTEzMTY1YjMxMzNhNjkyMzRmNGE3NWM4ZjciLCJleHAiOjE3OTAxNTczODN9.DpDm6Q6Hf7DIxXqMp3gULJJ80yYEZZoWF0WBVDRqL7c';

async function testPinataConnection() {
  console.log('🔌 Testing Pinata connection...');
  
  try {
    // Test 1: Check authentication with user data
    console.log('\n📋 Test 1: Checking authentication...');
    const authResponse = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    console.log('✅ Authentication successful!');
    console.log('📊 Response:', authResponse.data);

    // Test 2: Get account usage info
    console.log('\n📋 Test 2: Getting account usage...');
    const usageResponse = await axios.get('https://api.pinata.cloud/data/userPinnedDataTotal', {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    console.log('✅ Usage data retrieved!');
    console.log('💾 Pin count:', usageResponse.data.pin_count);
    console.log('📁 Pin size total:', (usageResponse.data.pin_size_total / 1024 / 1024).toFixed(2), 'MB');
    console.log('🔢 Pin size with replications:', (usageResponse.data.pin_size_with_replications_total / 1024 / 1024).toFixed(2), 'MB');

    // Test 3: Create a test file and upload
    console.log('\n📋 Test 3: Testing file upload...');
    
    // Create a test JSON file
    const testData = {
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      message: 'Test upload from Blue Carbon Registry'
    };
    
    const testFilePath = '/tmp/test-upload.json';
    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('pinataMetadata', JSON.stringify({
      name: 'Blue Carbon Registry Test File'
    }));
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1
    }));

    const uploadResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ File uploaded successfully!');
    console.log('📎 IPFS Hash:', uploadResponse.data.IpfsHash);
    console.log('🌐 Gateway URL:', `https://gateway.pinata.cloud/ipfs/${uploadResponse.data.IpfsHash}`);
    console.log('📏 File size:', uploadResponse.data.PinSize, 'bytes');

    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    console.log('\n🎉 All tests passed! Pinata credentials are working correctly.');
    console.log('🔒 Your files will be stored on IPFS and accessible globally through decentralized network.');

  } catch (error) {
    console.error('❌ Error testing Pinata:', error.message);
    if (error.response) {
      console.error('📄 Response data:', error.response.data);
      console.error('📊 Status code:', error.response.status);
    }
  }
}

testPinataConnection();