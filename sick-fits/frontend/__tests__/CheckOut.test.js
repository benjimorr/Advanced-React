import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import NProgress from 'nprogress';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import CheckOut from '../components/CheckOut';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

Router.router = { push() {} };

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  }
];

describe('<CheckOut />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CheckOut />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const checkoutButton = wrapper.find('ReactStripeCheckout');
    expect(toJSON(checkoutButton)).toMatchSnapshot();
  });

  it('creates an order ontoken', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CheckOut />
      </MockedProvider>
    );

    const checkoutComponent = wrapper.find('CheckOut').instance();

    // manually call the onToken method
    checkoutComponent.onToken({ id: 'abc123' }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: 'abc123' }
    });
  });

  it('turns the progress bar on', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });
    NProgress.start = jest.fn();

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CheckOut />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const checkoutComponent = wrapper.find('CheckOut').instance();

    // manually call the onToken method
    checkoutComponent.onToken({ id: 'abc123' }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
  });

  it('routes to the order page when completed', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });
    Router.router.push = jest.fn();

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CheckOut />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    const checkoutComponent = wrapper.find('CheckOut').instance();

    // manually call the onToken method
    checkoutComponent.onToken({ id: 'abc123' }, createOrderMock);
    await wait();

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/order',
      query: { id: 'xyz789' }
    });
  });
});
