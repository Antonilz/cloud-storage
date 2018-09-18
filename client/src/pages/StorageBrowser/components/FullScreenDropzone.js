import React, { PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import S3Upload from 'react-s3-uploader/s3upload';

class FullScreenDropzone extends PureComponent {
  static defaultProps = {
    upload: {},
    className: 'react-dropzone-s3-uploader',
    passChildrenProps: true,
    notDropzoneProps: [
      'onFinish',
      's3Url',
      'filename',
      'host',
      'upload',
      'isImage',
      'notDropzoneProps'
    ]
  };

  state = {
    dropzoneActive: false
  };

  constructor(props) {
    super();
    const uploadedFiles = [];
    const { filename } = props;
  }

  componentWillReceiveProps = props => this.setUploaderOptions(props);

  setUploaderOptions = props => {
    this.setState({
      uploaderOptions: {
        signingUrl: '/s3/sign',
        s3path: '',
        contentDisposition: 'auto',
        uploadRequestHeaders: { 'x-amz-acl': 'public-read' },
        onFinishS3Put: this.handleFinish,
        onProgress: this.handleProgress,
        onError: this.handleError,
        ...props.upload
      }
    });
  };

  onDragEnter() {
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    this.setState({
      dropzoneActive: false
    });
  }

  handleDrop(files, rejectedFiles) {
    const filesWithPath = files.map(file => {
      file.path = this.props.currentPath;
      return file;
    });
    this.setState({
      files,
      dropzoneActive: false,
      uploadedFiles: [],
      error: null,
      progress: null
    });
    const options = {
      files,
      ...this.state.uploaderOptions
    };
    new S3Upload(options); // eslint-disable-line
    this.props.onDrop && this.props.onDrop(files, rejectedFiles);
  }

  handleFinish = (info, file) => {
    const uploadedFile = Object.assign(
      {
        file
        //fileUrl: this.fileUrl(this.props.s3Url, info.filename)
      },
      info
    );
    const uploadedFiles = this.state.uploadedFiles;
    uploadedFiles.push(uploadedFile);
    this.setState({ uploadedFiles, error: null, progress: null }, () => {
      this.props.onFinish && this.props.onFinish(uploadedFile);
    });
  };

  handleProgress = (progress, textState, file) => {
    this.props.onProgress && this.props.onProgress(progress, textState, file);
    this.setState({ progress });
  };

  handleError = (err, file) => {
    this.props.onError && this.props.onError(err, file);
    this.setState({ error: err, progress: null });
  };

  fileUrl = (s3Url, filename) =>
    `${s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url}/${filename}`;

  render() {
    const {
      s3Url,
      passChildrenProps,
      children,
      imageComponent,
      fileComponent,
      progressComponent,
      errorComponent
    } = this.props;

    const { dropzoneActive, uploadedFiles } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff',
      zIndex: '100'
    };
    const childProps = { s3Url, ...this.state };
    const ProgressComponent = progressComponent || this.renderProgress;
    return (
      <Dropzone
        disableClick
        style={{ position: 'relative' }}
        onDrop={this.handleDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        ref={this.props.dropZoneRef}
      >
        {dropzoneActive && <div style={overlayStyle}>Drop files... </div>}
        {this.props.children}
        {this.state.progress > 0 && <ProgressComponent {...childProps} />}
      </Dropzone>
    );
  }
}

export default FullScreenDropzone;
