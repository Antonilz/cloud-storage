import { createSelector } from 'reselect';

const selectAuth = state => state.auth;

const selectTokensData = createSelector([selectAuth], auth => {
  return { ...auth.token };
});

export { selectTokensData };
