/* eslint-disable import/prefer-default-export */
import { GoalType } from '@/types/auth/Goal';
import ChaptersData from '@/types/ChaptersData';
import { isValidPageId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const SECONDS_LIMIT = 4 * 60 * 60; // 4 hours
const MIN_SECONDS = 60; // 1 minute

interface ReadingGoalPayload {
  type: GoalType;
  pages?: number;
  seconds?: number;
  range?: { startVerse: string; endVerse: string };
}

/**
 * A utility function to validate the reading goal data
 *
 * @param {ChaptersData} chaptersData
 * @param {ReadingGoalPayload} payload
 * @returns {boolean} is the payload valid
 */
export const validateReadingGoalData = (
  chaptersData: ChaptersData,
  { type, pages, seconds, range }: ReadingGoalPayload,
): boolean => {
  // if the user selected a pages goal and didn't enter a valid amount of pages, disable the next button
  if (type === GoalType.PAGES && !isValidPageId(pages)) return false;

  // if the user selected a time goal and didn't enter a valid amount of seconds, disable the next button
  // in theory, this should never happen because the input is a select, but just in case
  if (
    type === GoalType.TIME &&
    (Number.isNaN(seconds) || seconds > SECONDS_LIMIT || seconds < MIN_SECONDS)
  ) {
    return false;
  }

  // if the user selected a range goal and didn't enter a valid range, disable the next button
  if (type === GoalType.RANGE) {
    if (!range?.startVerse || !range?.endVerse) return false;
    if (
      !isValidVerseKey(chaptersData, range.startVerse) ||
      !isValidVerseKey(chaptersData, range.endVerse)
    ) {
      return false;
    }

    // check if the starting verse key is greater than the ending verse key
    const [startingChapter, startingVerse] = getVerseAndChapterNumbersFromKey(range.startVerse);
    const [endingChapter, endingVerse] = getVerseAndChapterNumbersFromKey(range.endVerse);

    if (startingChapter === endingChapter && Number(startingVerse) > Number(endingVerse)) {
      return false;
    }
  }

  return true;
};