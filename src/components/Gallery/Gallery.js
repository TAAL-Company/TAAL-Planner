import React, { useState, useEffect } from "react";
import "../Gallery/Gallery.css"
function Gallery(props) {
    const [images, setImages] = useState([]);
    const [offset, setOffset] = useState(0);
    const [uploadMessage, setUploadMessage] = useState('');

    useEffect(() => {
        async function fetchImages() {
            const response = await fetch(`https://taal.tech/wp-json/wp/v2/media?per_page=100&offset=${offset}`);
            const data = await response.json();
            setImages(prevImages => [...prevImages, ...data]);
        }

        fetchImages();
    }, [offset]);

    const loadMoreImages = () => {
        setOffset(offset + 100);
    }
    const handleUpload = async (e) => {
        e.preventDefault();

        const file = e.target.elements.file.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('caption', 'Uploaded using the Gallery component');
        formData.append('alt_text', 'Image uploaded to the Gallery');

        const response = await fetch(`https://taal.tech/wp-json/wp/v2/media`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            console.log("yyy data" , data)
            console.log("yyy images" , images)
            setImages(prevImages => [ data,...prevImages]);
            setUploadMessage('Image uploaded successfully!');

        } else {
            console.log(data);
        }
    }

    return (
        <div>
            <h1>Gallery</h1>
            <form onSubmit={handleUpload}>
                <input type="file" name="file" accept="image/*" required />
                <button type="submit">Upload</button>
            </form>
            {uploadMessage && <p>{uploadMessage}</p>}
            <div className="gallery">
                {images.map((image) => (
                    <img className="galleryImg" key={image.id} src={image.source_url} alt={image.alt_text} />
                ))}

            </div>
            <button className="loadMoreButton" onClick={loadMoreImages}>Load More Images</button>
        </div>
    );
}

export default Gallery;
