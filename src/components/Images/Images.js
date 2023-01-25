import "./style.css";
import Image from "react-bootstrap/Image";
// let image = "";
const Images = ({ id, url, flag }) => {
  console.log("IMAGES");
  console.log("id image: ", id);
  console.log("url image: ", url);
  console.log("flag image: ", flag);

  return (
    <>
      {flag && id ? (
        <>
          {url !== "" ? (
            <>
              <div className="imgTablet">
                <Image
                  style={{
                    width: "60px",
                    height: "69px",
                  }}
                  src={url}
                  alt="new"
                />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <>
          {url !== "" ? (
            <>
              <div className="img">
                <Image
                  style={{
                    width: "133px",
                    height: "89px",
                  }}
                  src={url}
                  alt="new"
                />
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