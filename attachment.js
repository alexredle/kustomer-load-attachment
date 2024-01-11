const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const kustomerApiKey = 'API_KEY'; 
//api key with access to org.user.note.write	org.permission.note.create org.user.message.write	org.permission.message.create
const fileURL = '/path/to/file'; // Replace with the actual image URL


function readFileAsArrayBuffer(filePath) {
    try {
      // Read the file synchronously
      const fileContent = fs.readFileSync(filePath);
  
      // Convert Buffer to ArrayBuffer
      const arrayBuffer = new Uint8Array(fileContent).buffer;
  
      return arrayBuffer;
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      return null;
    }
  }
// Function to create an attachment in Kustomer
async function createAttachment() {
    try {
        // Fetch the image data
        array = readFileAsArrayBuffer(fileURL);
        //get the lenght in bytes 
        let length = array.byteLength; 
        // URL for the Kustomer API endpoint to create an attachment
        const kustomerApiEndpoint = `https://api.kustomerapp.com/v1/attachments`;
        
        // Create the attachment payload
        const attachmentPayload = {
            contentLength: length,
            contentType: 'image/png', // Adjust based on your image type
            name: 'image.png', // Adjust based on your image file name
        };

        // Send the POST request to create the attachment
        const response = await axios.post(kustomerApiEndpoint, attachmentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${kustomerApiKey}`,
            },
        });

        
        if (response.data) {
            let attachId = response.data.data.id;
            let metaUrl = response.data.meta.upload.url;
            let fieldsData = response.data.meta.upload.fields;
            let data = new FormData();
            Object.keys(fieldsData).forEach(function (key) {
                data.append(key, fieldsData[key]);                
            });
            data.append('file', fs.createReadStream(fileURL));

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: metaUrl,
                headers: { 
                  ...data.getHeaders()
                },
                data : data
              };
              
              axios.request(config)
              .then((response2) => {
                console.log("Upload file:",response2.status, attachId);

              })
              .catch((error) => {
                console.log(error);
              });
        }

    } catch (error) {
        console.error('Error creating attachment:', error.response ? error.response.data : error.message);
    }
}

createAttachment();
