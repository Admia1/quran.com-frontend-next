import { useEffect, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './SidebarNavigation.module.scss';

import Link from '@/dls/Link/Link';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from '@/hooks/useScrollToElement';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logEmptySearchResults, logTextSearchQuery } from '@/utils/eventLogger';

const ScrollableSelection = ({
  items,
  searchPlaceholder,
  renderItem,
  getHref,
  isJuz = true,
  selectedItem,
  onAfterNavigationItemRouted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredItems = items.filter(
    (item) =>
      item.value.toString().startsWith(searchQuery) ||
      item.label.toString().startsWith(searchQuery),
  );

  useEffect(() => {
    if (!filteredItems.length) {
      logEmptySearchResults({
        query: searchQuery,
        source: isJuz
          ? SearchQuerySource.SidebarNavigationJuzsList
          : SearchQuerySource.SidebarNavigationPagesList,
      });
    } else {
      logTextSearchQuery(
        searchQuery,
        isJuz
          ? SearchQuerySource.SidebarNavigationJuzsList
          : SearchQuerySource.SidebarNavigationPagesList,
      );
    }
  }, [searchQuery, filteredItems, isJuz]);

  const [scroll, selectedItemRef] = useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);
  useEffect(() => {
    scroll();
  }, [selectedItem, scroll]);

  const navigateAndHandleAfterNavigation = (href: string) => {
    router.push(href).then(() => {
      if (onAfterNavigationItemRouted) {
        onAfterNavigationItemRouted();
      }
    });
  };

  // handle when user press `Enter` in input box
  const handleInputSubmit = (e) => {
    e.preventDefault();
    const firstFilteredItem = filteredItems[0];
    if (filteredItems) {
      const href = getHref(firstFilteredItem.value);
      navigateAndHandleAfterNavigation(href);
    }
  };

  const handleItemClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigateAndHandleAfterNavigation(href);
  };

  return (
    <div className={styles.scrollableSectionContainer}>
      <form onSubmit={handleInputSubmit}>
        <input
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </form>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredItems.map((item) => {
            const href = getHref(item.value);
            return (
              <Link
                href={href}
                key={item.value}
                shouldPrefetch={false}
                onClick={(e) => handleItemClick(e, href)}
              >
                <div
                  ref={item.value === selectedItem ? selectedItemRef : null}
                  className={classNames(
                    styles.listItem,
                    item.value === selectedItem && styles.selectedItem,
                  )}
                >
                  {renderItem(item)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScrollableSelection;
