import { ProvVizV1Page } from './app.po';

describe('prov-viz-v1 App', () => {
  let page: ProvVizV1Page;

  beforeEach(() => {
    page = new ProvVizV1Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
