import React from "react";

const ImagesTable = ({ images, language, handleDragStart }) => {
    return (
        <div style={{ flex: 0, overflow: 'auto', minWidth: 220 }}>
            <h4 style={{
                textAlign: language === 'English' ? 'right' : 'center',
                direction: language === 'English' ? 'rtl' : 'ltr'
            }}>
                {language === 'English' ? 'תמונות בגיליון' : 'Images In Sheet'}
            </h4>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                direction: language === 'English' ? 'rtl' : 'ltr'
            }}>
                <thead>
                    <tr>
                        <th style={{
                            border: '1px solid #ccc',
                            padding: 4,
                            background: '#f0f0f0',
                            direction: language === 'English' ? 'rtl' : 'ltr'
                        }}>
                            {language === 'English' ? 'תמונה' : 'Image'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img, idx) => (
                        <tr key={idx}>
                            <td style={{
                                border: '1px solid #ccc',
                                padding: 4,
                                direction: language === 'English' ? 'rtl' : 'ltr'
                            }}>
                                <img
                                    src={URL.createObjectURL(img.file)}
                                    alt={`img-${idx}`}
                                    style={{
                                        width: 150,
                                        height: 150,
                                        objectFit: 'contain',
                                        borderRadius: 4,
                                        cursor: 'grab',
                                        border: '2px dashed #256fa1',
                                        background: '#f8faff',
                                        marginRight: 8
                                    }}
                                    draggable
                                    onDragStart={() => handleDragStart(img)}
                                />
                                <span style={{
                                    fontSize: 18,
                                    color: '#256fa1',
                                    marginLeft: 4
                                }}>⇨</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ImagesTable;