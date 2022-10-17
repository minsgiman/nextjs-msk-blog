const videosData = [
  {
    id: '1',
    title: '신혼여행',
    description: '신혼여행 ~',
    startDate: '2017-11',
    titleImgUrl: '/static/images/photos/amalfi.jpg',
    videoUrl: 'https://drive.google.com/file/d/1Mnx17E86-JYdOlHRmawLww82nBrYel9Z/preview',
  },
  {
    id: '2',
    title: '지구 50일 촬영스케치',
    description: '지구 50일 촬영스케치',
    startDate: '2022-10',
    titleImgUrl: '/static/images/photos/jigu50.jpg',
    videoUrl: 'https://drive.google.com/file/d/1JB40KvzdptLQ1UxjKgIQ1Ee9B7umkxsT/preview',
  },
];

module.exports = videosData.reverse();
