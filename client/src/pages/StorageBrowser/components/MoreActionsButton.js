import React, { PureComponent } from 'react';
import { Dropdown } from 'semantic-ui-react';

class MoreActionsButton extends PureComponent {
  render() {
    const hasSelectedItems = this.props.numOfSelectedItems > 0;
    return (
      <Dropdown
        text={`Selected: ${this.props.numOfSelectedItems}`}
        pointing
        className="link item"
      >
        <Dropdown.Menu>
          <Dropdown.Item
            icon="delete"
            text="Delete"
            onClick={this.props.onDeleteSelectedItemsClick}
          />
          <Dropdown.Item icon="cut" text="Cut" />
          <Dropdown.Item icon="copy" text="Copy" />
          <Dropdown.Item
            icon="paste"
            text="Paste"
            disabled={!this.props.hasBufferedItems}
          />
          <Dropdown.Divider />
          <Dropdown.Item icon="download" text="Download as .zip" />
          <Dropdown.Item
            icon="tags"
            text="Edit tags"
            onClick={this.props.onTagsEditClick}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default MoreActionsButton;
