import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';

Router.router = {
  push() {},
  prefetch() {}
};

function makeMocksFor(length) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: 'aggregate',
            aggregate: {
              __typename: 'count',
              count: length
            }
          }
        }
      }
    }
  ];
}

describe('<Pagination />', () => {
  it('displays a loading message', () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    const loadingMessage = wrapper.find('p');

    expect(loadingMessage.text()).toBe('Loading...');
  });

  it('renders pagination for 18 items', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const totalPages = wrapper.find('.totalPages');
    expect(totalPages.text()).toEqual('5');

    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(toJSON(pagination)).toMatchSnapshot();
  });

  it('disables prev button on first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(12)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const prevButton = wrapper.find('a.prev');
    const nextButton = wrapper.find('a.next');
    expect(prevButton.prop('aria-disabled')).toBeTruthy();
    expect(nextButton.prop('aria-disabled')).toBeFalsy();
  });

  it('disables next button on last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(12)}>
        <Pagination page={3} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const prevButton = wrapper.find('a.prev');
    const nextButton = wrapper.find('a.next');
    expect(prevButton.prop('aria-disabled')).toBeFalsy();
    expect(nextButton.prop('aria-disabled')).toBeTruthy();
  });

  it('enables all buttons on a middle page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(12)}>
        <Pagination page={2} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const prevButton = wrapper.find('a.prev');
    const nextButton = wrapper.find('a.next');
    expect(prevButton.prop('aria-disabled')).toBeFalsy();
    expect(nextButton.prop('aria-disabled')).toBeFalsy();
  });
});
