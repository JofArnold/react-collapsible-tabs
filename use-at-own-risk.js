// Placeholder in the hope I'll do it properly later.

import React from 'react';
import classNames from 'classnames';
import styles from './Tabs.css';
import { Glyphicon } from 'react-bootstrap';

const TAB_HEIGHT = '36px';

export class Tabs extends React.PureComponent {
  static defaultProps = {
    className: null,
  };

  state = {
    isInMenuLookup: [],
    showMenu: false,
  };

  handleTabClick(eventKey) {
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(eventKey);
      this.setState({ showMenu: false });
    }
  }

  setVisibility = () => {
    if (!this.container) {
      return;
    }
    const isInMenuLookup = [];

    const containerRects = this.container.getBoundingClientRect();
    const containerBottom = containerRects.bottom;
    React.Children.map(this.props.children, (tab, idx) => {
      const childTop = this.tabComps[idx].getTop();
      isInMenuLookup.push(childTop > containerBottom);
    });
    const isInML = this.state.isInMenuLookup;
    if (!isInML.length || isInML.toString() !== isInMenuLookup.toString()) {
      this.setState({ isInMenuLookup });
    }
  };

  componentDidMount() {
    this.setVisibility();
    window.addEventListener('resize', this.setVisibility);
  }

  componentWillUnmount() {
    window.addEventListener('resize', this.setVisibility);
  }

  renderModifiedTabs() {
    const { activeKey, children } = this.props;

    const modified = [];

    React.Children.forEach(children, (tab, idx) => {
      const className = tab.props.className;
      const newClassName = classNames(className, styles.tab);
      modified.push(
        React.cloneElement(tab, {
          className: newClassName,
          active: activeKey === tab.props.eventKey,
          onClick: () => this.handleTabClick(tab.props.eventKey),
          style: { height: TAB_HEIGHT },
          ref: el => (this.tabComps[idx] = el),
        }),
      );
    });
    return modified;
  }

  render() {
    const { className, children, activeKey } = this.props;

    this.tabComps = [];
    const rootClassName = classNames(className, styles.root);

    const { isInMenuLookup } = this.state;
    let shouldShowCollapsed = false;
    if (isInMenuLookup.length <= 1) {
      shouldShowCollapsed = true;
    } else {
      shouldShowCollapsed =
        (isInMenuLookup[0] === false && isInMenuLookup[1] === true) ||
        isInMenuLookup[0] === true;
    }

    const menuClassName = classNames(
      styles.menu,
      styles[`menu--${shouldShowCollapsed ? 'collapsed' : 'default'}`],
    );

    const showMenu = this.state.showMenu;

    const tabs = React.Children.toArray(children);
    const activeTab = tabs.find(tab => activeKey === tab.props.eventKey);
    let title;
    let count;
    if (activeTab) {
      title = activeTab.props.title;
      count = activeTab.props.count;
    } else {
      title = 'Select';
    }

    return (
      <div className={styles.container} style={{ height: TAB_HEIGHT }}>
        <ul
          className={rootClassName}
          style={{
            padding: 0,
            border: 0,
            height: TAB_HEIGHT,
            visibility: shouldShowCollapsed ? 'hidden' : 'visible',
          }}
          ref={el => (this.container = el)}
        >
          {this.renderModifiedTabs()}
        </ul>
        {!!isInMenuLookup.find(e => e === true) &&
          <div className={menuClassName}>
            <button
              className={styles.menuButton}
              style={{ height: TAB_HEIGHT }}
              onClick={() => this.setState({ showMenu: !showMenu })}
            >
              {shouldShowCollapsed
                ? <span className={styles.buttonLabel}>
                    <span className={styles.buttonTitle}>{title}</span>
                    <span className={styles.buttonCount}>{count}</span>
                  </span>
                : <span className={styles.buttonLabel}>More</span>}
              <Glyphicon
                className={styles.chevron}
                glyph={showMenu ? 'chevron-up' : 'chevron-down'}
              />
            </button>
            {showMenu &&
              <div className={styles.dropdown}>
                {React.Children.map(children, (tab, idx) => {
                  if (isInMenuLookup[idx]) {
                    return React.cloneElement(tab, {
                      className: styles.menuTab,
                      onClick: () => this.handleTabClick(tab.props.eventKey),
                      active: activeKey === tab.props.eventKey,
                    });
                  } else {
                    return null;
                  }
                })}
              </div>}
          </div>}
      </div>
    );
  }
}

export default Tabs;
