import React, { Component } from 'react';
import { connect } from 'react-redux';
import Lightbox from 'react-images';
import { selectImages } from 'selectors';
class Gallery extends Component {
  state = {
    lightboxIsOpen: false,
    currentImage: 0
  };
  openLightbox = (index, event) => {
    event.preventDefault();
    this.setState({
      currentImage: index,
      lightboxIsOpen: true
    });
  };
  closeLightbox = () => {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false
    });
  };
  gotoPrevious = () => {
    this.setState({
      currentImage: this.state.currentImage - 1
    });
  };
  gotoNext = () => {
    this.setState({
      currentImage: this.state.currentImage + 1
    });
  };
  gotoImage = index => {
    this.setState({
      currentImage: index
    });
  };
  handleClickImage = () => {
    if (this.state.currentImage === this.props.images.length - 1) return;

    this.gotoNext();
  };
  render() {
    const images = this.props.images.map(image => {
      return { src: image.url };
    });
    return (
      <div>
        <Lightbox
          images={images}
          isOpen={this.state.lightboxIsOpen}
          onClickImage={this.handleClickImage}
          onClickNext={this.gotoNext}
          onClickPrev={this.gotoPrevious}
          onClickThumbnail={this.gotoImage}
          onClose={this.closeLightbox}
          showThumbnails={true}
          theme={this.props.theme}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  images: selectImages(state)
});

export default connect(mapStateToProps)(Gallery);
