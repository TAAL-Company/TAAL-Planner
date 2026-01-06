import React from "react";
import { useTranslation } from "react-i18next";

const ImagesTable = ({ images, language, handleDragStart }) => {
    const { t } = useTranslation();

    return (
        <div style={{ flex: 0, overflow: 'auto', minWidth: 220 }}>
            <h4 style={{
                textAlign: t('Direction') === 'rtl' ? 'right' : 'center',
                direction: t('Direction')
            }}>
                {t('SpreadsheetPopup.Images_In_Sheet')}
            </h4>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                direction: t('Direction')   
            }}>
                <thead>
                    <tr>
                        <th style={{
                            border: '1px solid #ccc',
                            padding: 4,
                            background: '#f0f0f0',
                            direction: t('Direction')
                        }}>
                            {t('SpreadsheetPopup.Image')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {images.map((img, idx) => (
                        <tr key={idx}>
                            <td style={{
                                border: '1px solid #ccc',
                                padding: 4,
                                direction: t('Direction')
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