import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createFileRequest } from '../actions/storage';
import { Grid, Header, Progress } from 'semantic-ui-react';
import DropzoneS3Uploader from 'react-dropzone-s3-uploader';
import { UPLOAD_URL } from '../constants/api';

class UploadToS3 extends Component {
  handleFinishedUpload = info => {
    const file = {
      uuid: info.fileKey,
      name: info.file.name,
      size: info.file.size,
      type: info.file.type === '' ? 'text/plain' : info.file.type
    };
    this.props.createFile(this.props.token, this.props.path, file);
  };

  renderUploadProgress({ progress }) {
    return progress > 0 && <Progress percent={progress} indicating />;
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
      <Grid textAlign="center" verticalAlign="middle">
        <Grid.Column>
          <Header as="h2" color="teal" textAlign="center">
            Upload files
          </Header>
          <DropzoneS3Uploader
            onFinish={this.handleFinishedUpload}
            s3Url={s3Url}
            maxSize={1024 * 1024 * 100} // 100 MB file size limit
            upload={uploadOptions}
            progressComponent={this.renderUploadProgress}
            fileComponent={this.renderUploadedFile}
          />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { createFileRequest })(UploadToS3);
