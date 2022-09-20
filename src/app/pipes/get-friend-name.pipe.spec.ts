import { GetFriendNamePipe } from './get-friend-name.pipe';

describe('GetFriendNamePipe', () => {
  it('create an instance', () => {
    const pipe = new GetFriendNamePipe();
    expect(pipe).toBeTruthy();
  });
});
