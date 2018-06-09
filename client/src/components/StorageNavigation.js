import React, { PureComponent } from 'react';
import { separateLink } from '../utils/separateLink';
import { Breadcrumb, Icon } from 'semantic-ui-react';

class StorageNavigation extends PureComponent {
  handleLinkClick({ pathSlug }) {
    this.props.onFolderClick({ pathSlug, notInitial: true });
  }

  renderBreadcrumb({ name, pathSlug, nameSlug, index, last }) {
    if (name === 'storage') {
      if (!last) {
        return [
          <Icon
            key={index}
            onClick={e => this.handleLinkClick({ pathSlug })}
            name="home"
            link
            style={{ color: '#5995ED' }}
          />,
          <Breadcrumb.Divider icon="right chevron" key={`${index}-divider`} />
        ];
      } else {
        return <Icon key={index} name="home" />;
      }
    }
    if (!last) {
      return [
        <Breadcrumb.Section
          key={index}
          link
          onClick={e => this.handleLinkClick({ pathSlug })}
        >
          {name}
        </Breadcrumb.Section>,
        <Breadcrumb.Divider icon="right chevron" key={`${index}-divider`} />
      ];
    } else return <Breadcrumb.Section key={index}>{name}</Breadcrumb.Section>;
  }

  render() {
    const splitLink = separateLink(`/storage/${this.props.pathSlug}`);
    const { names } = separateLink(`/storage/${this.props.path}`);
    return (
      <Breadcrumb size="big">
        {splitLink.names.map((curr, index) => {
          let last = false;
          if (index === names.length - 1) {
            last = true;
          }
          return this.renderBreadcrumb({
            name: names[index],
            pathSlug: splitLink.links[index],
            nameSlug: splitLink.names[index],
            index,
            last
          });
        })}
      </Breadcrumb>
    );
  }
}

export default StorageNavigation;
