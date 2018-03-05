import React, { PureComponent } from 'react';
import {
  Grid,
  Icon,
  Checkbox,
  Dropdown,
  Menu,
  Header,
  Button,
  Card,
  Container
} from 'semantic-ui-react';
import { formatBytes } from '../utils/formatBytes';
import moment from 'moment';

class FilesViewGrid extends PureComponent {
  renderDownloadLink(link) {
    return <Menu.Item icon="download" href={link} />;
  }

  renderItem(item, index) {
    const lastModified = moment(item.data.updatedAt).format('DD/MM/YYYY HH:mm');
    return (
      <Grid.Column
        stretched
        width="4"
        key={index}
        onClick={e =>
          this.props.onFolderClick(this.props.token, item.data.path, true)
        }
      >
        <Card centered raised color="blue">
          <Container textAlign="center">
            {item.type == 'folder' ? (
              <Icon name="folder" size="massive" />
            ) : (
              <Icon name="file" size="massive" />
            )}
          </Container>
          <Card.Content>
            <Card.Header
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {item.data.name}
            </Card.Header>
          </Card.Content>
        </Card>
        <Checkbox
          checked={item.checked}
          onChange={(e, data) => {
            e.stopPropagation();
            this.props.onItemCheck(item.data.id, data.checked);
          }}
        />
      </Grid.Column>
    );
  }

  render() {
    const { items } = this.props;
    return (
      <Grid>
        {items.children.map((item, index) => {
          return this.renderItem(item, index);
        })}
      </Grid>
    );
  }
}

export default FilesViewGrid;
