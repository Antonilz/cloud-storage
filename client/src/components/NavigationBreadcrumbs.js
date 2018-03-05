import React, { PureComponent } from 'react';
import { separateLink } from '../utils/separateLink';
import { Breadcrumb } from 'semantic-ui-react';

class NavigationBreadcrumbs extends PureComponent {
  handleLinkClick(link) {
    const path = link.replace(/\/storage.|\/storage/, '');
    this.props.onFolderClick(this.props.token, path, true);
  }

  renderBreadcrumb(name, link, index, last = false) {
    if (last) {
      return <Breadcrumb.Section key={index}>{name}</Breadcrumb.Section>;
    } else {
      return [
        <Breadcrumb.Section
          link
          key={index}
          onClick={e => this.handleLinkClick(link)}
        >
          {name}
        </Breadcrumb.Section>,
        <Breadcrumb.Divider icon="right chevron" key={`${index}-divider`} />
      ];
    }
  }

  render() {
    const { names, links } = separateLink(this.props.path);
    return (
      <Breadcrumb size="big">
        {names.map((curr, index) => {
          if (index === names.length - 1) {
            return this.renderBreadcrumb(
              names[index],
              links[index],
              index,
              true
            );
          } else {
            return this.renderBreadcrumb(names[index], links[index], index);
          }
        })}
      </Breadcrumb>
    );
  }
}

export default NavigationBreadcrumbs;
