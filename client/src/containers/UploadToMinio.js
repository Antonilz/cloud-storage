import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { createFileRequest } from '../actions/storage';
import { Grid, Header, Progress, Segment } from 'semantic-ui-react';
import { formatBytes } from '../utils/formatBytes';
import FullScreenDropzone from './FullScreenDropzone';
import { UPLOAD_URL } from '../constants/api';
import mime from 'mime-types';

class UploadToMinio extends PureComponent {
  handleFinishedUpload = info => {
    const file = {
      uuid: info.fileKey,
      name: info.file.name,
      size: info.file.size,
      type: info.file.type === '' ? mime.lookup(info.file.name) : info.file.type
    };
    const samePath = this.props.path == info.file.path;
    this.props.createFile({ path: info.file.path, file, samePath });
  };

  renderUploadProgress({ progress, files }) {
    const file = files[0];
    const formattedTotalBytes = formatBytes(file.size);
    const formattedUploadedBytes = formatBytes(
      Math.round(progress * file.size / 100)
    );
    return (
      progress > 0 && (
        <Segment
          style={{
            position: 'fixed',
            bottom: '0',
            right: '0',
            width: '250px'
          }}
          size="large"
        >
          <Header as="h4" color="violet">
            {file.name}
          </Header>
          <Progress percent={progress} indicating size="medium" />
          <Header as="h4" color="grey">
            {formattedUploadedBytes} / {formattedTotalBytes}
          </Header>
        </Segment>
      )
    );
  }
  renderUploadedFile({ uploadedFile }) {
    console.log(uploadedFile.file.name);
    return (
      <Header as="h2" color="teal">
        {uploadedFile.file.name}
      </Header>
    );
  }
  render() {
    let fileType = '';
    const uploadOptions = {
      server: UPLOAD_URL,
      preprocess: (file, next) => {
        fileType = file.type;
        next(file);
      },
      signingUrlHeaders: { Authorization: `Bearer ${this.props.token}` },
      signingUrlQueryParams: { folder: this.props.path }
    };
    const s3Url = this.props.S3BucketURL;

    return (
      <FullScreenDropzone
        onFinish={this.handleFinishedUpload}
        s3Url={s3Url}
        currentPath={this.props.path}
        maxSize={1024 * 1024 * 100} // 100 MB file size limit
        upload={uploadOptions}
        progressComponent={this.renderUploadProgress}
        fileComponent={this.renderUploadedFile}
        dropZoneRef={this.props.dropZoneRef}
      >
        {this.props.children}
      </FullScreenDropzone>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { createFileRequest })(UploadToMinio);
