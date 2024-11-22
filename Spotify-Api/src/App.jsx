import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
  Col,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [artistAlbums, setAristAlbums] = useState([]);
  const [albumDetails, setAlbum] = useState("");
  const [albumsSearchDetails, setSearchAlbums] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // API Access Token
    const authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        CLIENT_SECRET,
    };

    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token))
      .catch((error) =>
        console.error("Error fetching Spotify API token:", error)
      );
  }, []);

  //Search Function
  async function Search() {
    setHasSearched(true); 
    console.log("Search for " + searchInput);
    //Get request using sear to get Artist ID
    var searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    try {
      //--------------------------------------------------------------------Request Artist Albums--------------------------------------------------------------|
      console.log("Starting artist Albums request");
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        searchParameters
      );
      const artistData = await artistResponse.json();
      const artistID = artistData.artists.items[0]?.id;

      if (!artistID) {
        console.error("Artist not found");
        return;
      }

      var artistAlbumsResponse = await fetch(
        "https://api.spotify.com/v1/artists/" +
          artistID +
          "/albums" +
          "?include_groups=album&market=US&limit=20",
        searchParameters
      );
      const artistAlbumsData = await artistAlbumsResponse.json();
      setAristAlbums(artistAlbumsData.items);

      //--------------------------------------------------------------------Request Single Album---------------------------------------------------------------|
      console.log("Starting Album ID request");
      var albumResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=album`,
        searchParameters
      );
      const albumResponseData = await albumResponse.json();
      const albumID = albumResponseData.albums.items[0]?.id;
      if (!albumID) {
        console.error("Album not found");
        return;
      }
      console.log("Got Album ID");
      console.log("this is album ID " + albumID);

      //get specific Album
      var singleAlbumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${albumID}`,
        searchParameters
      );

      const singleAlbumData = await singleAlbumResponse.json();
      console.log(singleAlbumData);

      // Validate single album data
      if (!singleAlbumData) {
        console.error("No data found for album ID:", albumID);
        return;
      }
      setAlbum(singleAlbumData);

      //--------------------------------------------------------------------Request Multiple Album Request------------------------------------------------------|
      console.log("Starting Albums Requests");
      const albumsSearchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchInput
        )}&type=album&limit=20`,
        searchParameters
      );
      if (!albumsSearchResponse.ok) {
        console.error("Failed to fetch albums");
        return;
      }

      const albumsSearchData = await albumsSearchResponse.json();
      console.log("Found Albums");
      // Filter albums based on popularity (above 70) or take the top 3
      const searchedAlbums = albumsSearchData.albums.items
      console.log("Filtered Albums");
      setSearchAlbums(searchedAlbums);
    } catch (error) {
      console.error("Error in Search function:", error);
    }
  }
  return (
    <div className="py-4">
  <Container>
    <InputGroup className="mb-3" size="lg">
      <FormControl
        placeholder="Search For Artist"
        type="input"
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            Search();
          }
        }}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <Button onClick={Search}>Search</Button>
    </InputGroup>
  </Container>

  {hasSearched && (
    <>
      {/* Artist Albums Section */}
      {artistAlbums.length > 0 && (
        <Container className="mb-5">
          <h2 className="mb-3">Artist Albums</h2>
          <Row className="mx-2">
            {artistAlbums.map((album) => (
              <Col key={album.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Card>
                  <Card.Img
                    src={album.images[0]?.url || "https://via.placeholder.com/150"}
                    alt={album.name}
                  />
                  <Card.Body>
                    <Card.Title>{album.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Search Results Section */}
      <Container>
        <h2 className="mb-3">Search Results</h2>
        <Row className="mx-2">
          {albumsSearchDetails.length > 0 ? (
            albumsSearchDetails.map((album) => (
              <Col key={album.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Card>
                  <Card.Img
                    src={album.images[0]?.url || "https://via.placeholder.com/150"}
                    alt={album.name}
                  />
                  <Card.Body>
                    <Card.Title>{album.name}</Card.Title>
                    <Card.Text>Popularity: {album.popularity}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col className="text-center mt-4">
              <p>No albums found for "{searchInput}". Try another search!</p>
            </Col>
          )}
        </Row>
      </Container>
    </>
  )}
</div>
)};
export default App;
