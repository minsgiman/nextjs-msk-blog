import { useCallback, useState } from 'react'
import classnames from 'classnames'

import videosData from '@/data/videosData'
import Link from '@/components/Link'

export function getStaticPaths() {
  return {
    paths: videosData.map((videoObj) => ({
      params: {
        id: videoObj.id,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const video = videosData.find((videoObj) => {
    return videoObj.id === params.id
  })
  return { props: { video } }
}

export default function Video({ video }) {
  const [isLoadFinish, setIsLoadFinish] = useState(false)

  const onIframeLoad = useCallback(() => {
    if (!isLoadFinish) {
      setIsLoadFinish(true)
    }
  }, [])

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            <Link href="/videos/">
              <button>Videos </button>
            </Link>
            <span className="triangle-right"></span>
            {video.title}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{video.description}</p>
        </div>
        <div className="container py-12">
          <div className={classnames('videos_wrap', { hide: !isLoadFinish })}>
            <iframe src={video.videoUrl} onLoad={onIframeLoad}></iframe>
          </div>
          {!isLoadFinish && (
            <img className="loading" src="/static/images/progress_rolling_blue.svg" />
          )}
        </div>
      </div>
    </>
  )
}
