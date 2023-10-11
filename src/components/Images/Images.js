import './style.css';
import Image from 'react-bootstrap/Image';
// let image = "";
const Images = ({ id, url, flag }) => {
  return (
    <>
      {flag && id ? (
        <>
          {url !== '' ? (
            <>
              <div className='imgTablet'>
                <Image
                  style={{
                    width: '60px',
                    height: '69px',
                  }}
                  src={url}
                  alt='new'
                />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <>
          {url !== '' ? (
            <>
              <div>
                <Image className='taskImagePhone' src={url} alt='new' />
              </div>
            </>
          ) : null}
        </>
      )}
    </>
  );
};
export default Images;
//----------------------------------------
