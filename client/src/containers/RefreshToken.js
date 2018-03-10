import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { userInfoRequest, restoreTokensRequest } from '../actions/auth';
import { checkToken, getToken } from '../utils/localStorage';

class RefreshToken extends PureComponent {
  componentWillMount() {
    console.log('refresh');
    checkToken('refreshToken') && this.props.restoreTokensRequest();
  }

  render() {
    return this.props.children;
  }
}

export default connect(null, { userInfoRequest, restoreTokensRequest })(
  RefreshToken
);
