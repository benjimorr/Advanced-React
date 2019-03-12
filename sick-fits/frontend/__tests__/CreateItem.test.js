import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';
import { fakeItem } from '../lib/testUtils';

const dogImage = 'https://dog.com/dog.jpg';

// mock the global fetch API
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }]
  })
});

describe('<CreateItem />', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="create-item-form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it('uploades a file when changed', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const fileInput = wrapper.find('input[type="file"]');
    fileInput.simulate('change', {
      target: {
        files: ['fakedog.jpg']
      }
    });

    await wait();

    const createItemComponent = wrapper.find('CreateItem').instance();
    expect(createItemComponent.state.image).toEqual(dogImage);
    expect(createItemComponent.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();

    global.fetch.mockReset();
  });

  it('handles state updating', () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find('#title')
      .simulate('change', { target: { name: 'title', value: 'Testing' } });
    wrapper.find('#price').simulate('change', {
      target: { name: 'price', value: 50000, type: 'number' }
    });
    wrapper.find('#description').simulate('change', {
      target: { name: 'description', value: 'This is a really nice item' }
    });

    const createItemComponent = wrapper.find('CreateItem').instance();
    expect(createItemComponent.state).toMatchObject({
      title: 'Testing',
      price: 50000,
      description: 'This is a really nice item'
    });
  });

  it('creates an item when the form is submitted', async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: '',
            largeImage: '',
            price: item.price
          }
        },
        result: {
          data: {
            createItem: {
              ...item,
              id: 'abc123',
              __typename: 'Item'
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    // simulate someone filling out the form
    wrapper
      .find('#title')
      .simulate('change', { target: { name: 'title', value: item.title } });
    wrapper.find('#price').simulate('change', {
      target: { name: 'price', value: item.price, type: 'number' }
    });
    wrapper.find('#description').simulate('change', {
      target: { name: 'description', value: item.description }
    });

    // mock the router
    Router.router = { push: jest.fn() };

    wrapper.find('form').simulate('submit');
    await wait(50);

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/item',
      query: {
        id: 'abc123'
      }
    });
  });
});
