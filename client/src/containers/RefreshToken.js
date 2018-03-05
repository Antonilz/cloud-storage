import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { userInfoRequest } from '../actions/auth';
import { checkToken, getToken } from '../utils/localStorage';

class RefreshToken extends PureComponent {
  componentDidMount() {
    checkToken('refreshToken') &&
      this.props.userInfoRequest(getToken('refreshToken'));
  }

  render() {
    return this.props.children;
  }
}

export default connect(null, { userInfoRequest })(RefreshToken);
