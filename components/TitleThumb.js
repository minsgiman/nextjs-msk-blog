import React, { useCallback } from 'react';

import Image from './Image';

const TitleThumb = ({ id, onClick, imgUrl, title, description, startDate }) => {
  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  return (
    <div className="title_thumb" onClick={handleClick}>
      <div className="img_box">
        <Image src={imgUrl} alt={title} layout="fill" />
        <div className="inner_info">
          <span className="date_info">{startDate}</span>
          <span className="tit_info">{title}</span>
        </div>
      </div>
      <div className="desc_wrap">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default TitleThumb;
