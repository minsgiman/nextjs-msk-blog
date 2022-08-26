import { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';
import photosData from '@/data/photosData';
import Link from '@/components/Link';

export function getStaticPaths() {
  return {
    paths: photosData.map((photoObj) => ({
      params: {
        id: photoObj.id,
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const photo = photosData.find((photoObj) => {
    return photoObj.id === params.id;
  });
  return { props: { photo: photo } };
}

export default function Photo({ photo }) {
  const imageItems = useMemo(() => {
    const images = photo?.images;

    if (!images) {
      return [];
    }

    images.forEach((image) => {
      if (!image.thumbnail) {
        image.thumbnail = image.original;
      }
    });

    return images;
  }, [photo]);

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            <Link href="/photos/">
              <button>Photos </button>
            </Link>
            <span className="triangle-right"></span>
            {photo.title}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{photo.description}</p>
        </div>
        <div className="container py-12">
          <div className={'photos_wrap'}>
            <ImageGallery items={imageItems} showNav={false} />
          </div>
        </div>
      </div>
    </>
  );
}
