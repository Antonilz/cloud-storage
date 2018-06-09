import React, { PureComponent } from 'react';
import { separateLink } from 'utils/separateLink';
import { Breadcrumb, Icon } from 'semantic-ui-react';

class NavigationBreadcrumbs extends PureComponent {
  handleLinkClick({ pathSlug }) {
    this.props.onFolderClick({ pathSlug, notInitial: true });
  }

  renderBreadcrumb({ name, pathSlug, index, last }) {
    if (name === 'home') {
      if (!last) {
        return [
          <Icon
            key={index}
            onClick={e => this.handleLinkClick({ pathSlug })}
            name="home"
            link
            size="large"
            style={{ color: '#5995ED' }}
          />,
          <Breadcrumb.Divider icon="right chevron" key={`${index}-divider`} />
        ];
      } else {
        return <Icon key={index} size="large" name="home" />;
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
    const splitLink = separateLink(this.props.pathSlug);
    const { names } = separateLink(this.props.path);
    splitLink.links.unshift('');
    names.unshift('home');
    return (
      <Breadcrumb size="big" style={{ padding: '10px 0' }}>
        {splitLink.links.map((curr, index) => {
          let last = false;
          if (index === names.length - 1) {
            last = true;
          }
          return this.renderBreadcrumb({
            name: names[index],
            pathSlug: splitLink.links[index],
            index,
            last
          });
        })}
      </Breadcrumb>
    );
  }
}

export default NavigationBreadcrumbs;
