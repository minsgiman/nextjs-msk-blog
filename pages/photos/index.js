import { useCallback } from 'react';
import Router from 'next/router';

import TitleThumb from '@/components/TitleThumb';
import photosData from '@/data/photosData';

export default function Photos() {
  const onClick = useCallback((id) => {
    Router.push(`/photos/${id}`);
  }, []);

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Photos
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">my photos</p>
        </div>
        <div className="container py-12">
          <div className="flex flex-wrap justify-around content-between">
            {photosData.map((item) => (
              <TitleThumb
                id={item.id}
                key={item.id}
                onClick={onClick}
                imgUrl={item.titleImgUrl}
                title={item.title}
                description={item.description}
                startDate={item.startDate}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
