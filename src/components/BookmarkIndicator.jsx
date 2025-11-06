/**
 * BookmarkIndicator - Button to view all bookmarks
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const BookmarkIndicator = ({
  hasBookmark,
  bookmarkColor = '#FF6B6B',
  bookmarkCount = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.viewButton,
        hasBookmark && {borderColor: bookmarkColor, borderWidth: 2, borderStyle: 'solid'}
      ]}
      onPress={onPress}>
      <Text style={styles.viewIcon}>📚</Text>
      <Text style={styles.viewText}>
        {bookmarkCount > 0 ? `View Bookmarks (${bookmarkCount})` : 'View Bookmarks'}
      </Text>
      {hasBookmark && (
        <View style={[styles.currentPageDot, {backgroundColor: bookmarkColor}]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  viewText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  currentPageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default BookmarkIndicator;
