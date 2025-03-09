import { DNA } from "react-loader-spinner";

function Loader() {
    return (
    <div className="loader" style={{display: "flex", flexDirection : "column", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#FFFFFFFF", margin: "30px", borderRadius: "10px"}}>
        <DNA
            visible={true}
            height="80"
            width="80"
            ariaLabel="Loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
        />
    </div>
      );
};
export default Loader;