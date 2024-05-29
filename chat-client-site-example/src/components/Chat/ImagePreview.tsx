import { Loader, Image } from '@mantine/core'
import React, { useState, useEffect } from 'react'
import classes from '@/styles/components/lk/MessageMassage.module.css'
import { IconCircleX } from '@tabler/icons-react'
// Импортируйте Image, Loader и любые другие необходимые компоненты

interface ImagePreviewProps {
    file: File; // FileWithPath, если у вас есть дополнительные атрибуты в файле
    index: number; // Опционально, если вам нужен индекс для ключей или других целей
    onCancel: () => void
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, index, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        // Создаём URL для файла
        const url = URL.createObjectURL(file);
        setImageUrl(url);

        // Освобождаем URL после того, как компонент будет размонтирован
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    if (!imageUrl) return null; // или отобразить загрузчик, если URL ещё не получен

    return (
        <div className={classes.previewFile}>
            {loading ? (
                <Loader /> // Используйте свой компонент Loader
            ) : null}
            {/* <img
                style={{ pointerEvents: 'none', userSelect: 'none', display: loading ? 'none' : 'block' }}
                src={imageUrl}
                onLoad={() => setLoading(false)}
                alt={`Preview ${index}`}
            /> */}
            <div className={classes.previewFileCancel} onClick={() => onCancel()}>
                <IconCircleX color='#fff' />
            </div>
            <Image
                style={{ pointerEvents: 'none', userSelect: 'none' }}
                radius={12}
                key={index}
                src={imageUrl}
                onLoad={() => {
                    URL.revokeObjectURL(imageUrl)
                    setLoading(false)
                }}
            />
        </div>
    );
};

export default ImagePreview
