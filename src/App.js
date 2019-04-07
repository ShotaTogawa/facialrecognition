import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import clarifaiApikey from './apikey';
import './App.css'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';


const particleOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const app = new Clarifai.App({
  apiKey: clarifaiApikey
 });
 


class App extends Component {
  constructor() {
    super()
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signout',
      isSignedIn : false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState( {user :{
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  componentDidMount() {
    fetch('http://localhost:3000')
    .then(response => response.json())
    .then(console.log)
  }


  calcurateFaceLocation = (data) =>{
    // clarifaiFace Apiからデータを取得
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    // 取得したデータを表示する個所の指定
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  // 顔の輪郭を囲むボックスのstateを指定
  displayFaceBox = (box) => {
    this.setState({box: box})
  }
  // input fieldに入力された値をinput(state)に指定
  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  //入力された値をimageUrl(state)に指定し、顔の輪郭を返す
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))
      })
    }
      this.displayFaceBox(this.calcurateFaceLocation(response))
    })
    .catch(err => console.log(err))  
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home'){
      this.setState({isSignedIn: true})
    } 
    this.setState({route: route})
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
         <Particles 
            className="particles"
            // propsを子に渡す
            params={particleOptions}  />
        <Navigation 
            isSignedIn={isSignedIn} 
            onRouteChange={this.onRouteChange} 
        />
        { route === 'home' 
        ? <div>
        <Logo />
        <Rank 
          name={this.state.user.name} 
          entries={this.state.user.entries}/>
        <ImageLinkForm 
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
        : (
          route === 'signin' 
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )
        }
      </div>
    );
  }
}

export default App;
