// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
import { BlobServiceClient } from '@azure/storage-blob';

const sasToken =process.env.REACT_APP_STORAGE_SAS_TOKEN ||
   '?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2035-02-16T01:12:10Z&st=2025-02-15T17:12:10Z&spr=https,http&sig=cp2HYd4HFqlP0NWK7cYQhR8HP3ul6VjgkxiFReIfal4%3D'
// '?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-02-12T20:01:37Z&st=2024-02-12T12:01:37Z&spr=https,http&sig=XjpFdJl6WweqY0j9MrQDiubPMqOdUtM16QhmPK7h3aI%3D'
// '?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-12-31T14:50:42Z&st=2023-05-31T05:50:42Z&spr=https,http&sig=k%2F88nLfkD%2BFXBc%2FC5rdWNHE7gTNfPr2M5pm%2Fa0oSfIA%3D'; // Fill string with your SAS token
     
const containerName = process.env.REACT_APP_STORAGE_CONTAINER_NAME || `images`;
const storageAccountName = process.env.REACT_APP_STORAGE_RESOURCE_NAME || 'taalmedia'; // Fill string with your Storage resource name

// Feature flag - disable storage feature to app if not configured
export const isStorageConfigured = () => {
  return !(!storageAccountName || !sasToken);
};

// return list of blobs in container to display
export const getBlobsInContainer = async () => {
  const returnedBlobUrls = [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );
  // get Container - full public read access
  const containerClient = blobService.getContainerClient(containerName);

  // get list of blobs in container
  // eslint-disable-next-line
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  return returnedBlobUrls;
};

const createBlobInContainer = async (containerClient, file) => {
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(file.name);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  await blobClient.uploadBrowserData(file, options);
  await blobClient.setMetadata({ UserName: 'shubham' });
};

const uploadFileToBlob = async (file) => {
  if (!file) return [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );
  // get Container - full public read access
  const containerClient = blobService.getContainerClient(containerName);

  // upload file
  await createBlobInContainer(containerClient, file);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};
// </snippet_uploadFileToBlob>

/**
 * Upload a video Blob to Azure Blob Storage under the 'Route media/video/' virtual folder.
 * @param {Blob} blob - The video blob to upload
 * @param {string} routeName - The route name (used as the blob file name)
 * @param {string} ext - File extension without dot (e.g. 'webm' or 'mp4')
 * @returns {Promise<string>} The public URL of the uploaded video
 */
export const uploadVideoToAzure = async (blob, routeName, ext = 'webm') => {
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );
  const containerClient = blobService.getContainerClient(containerName);

  const timestamp = Date.now();
  const safeName = (routeName || 'route').replace(/[^\w\u0080-\uFFFF\s-]/g, '').trim().replace(/\s+/g, '_');
  const blobName = `Route media/video/${safeName}-${timestamp}.${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const options = { blobHTTPHeaders: { blobContentType: blob.type } };
  await blockBlobClient.uploadData(blob, options);

  return `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}`;
};

export default uploadFileToBlob;
