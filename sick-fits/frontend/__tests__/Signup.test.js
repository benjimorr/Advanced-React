import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';
import Signup, { SIGNUP_MUTATION } from '../components/Signup';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser } from '../lib/testUtils';

function type(wrapper, name, value) {
  wrapper.find(`input[name="${name}"]`).simulate('change', {
    target: { name, value }
  });
}

const me = fakeUser();
const mocks = [
  // signup mock mutation
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: me.email,
        name: me.name,
        password: 'password'
      }
    },
    result: {
      data: {
        signup: {
          __typename: 'User',
          id: me.id,
          email: me.email,
          name: me.name
        }
      }
    }
  },
  // current user query mock
  {
    request: {
      query: CURRENT_USER_QUERY
    },
    result: {
      data: { me }
    }
  }
];

describe('<Signup />', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    );

    const signUpForm = wrapper.find('form');
    expect(toJSON(signUpForm)).toMatchSnapshot();
  });

  it('calls the mutation properly', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <Signup />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    type(wrapper, 'name', me.name);
    type(wrapper, 'email', me.email);
    type(wrapper, 'password', 'password');

    wrapper.update();
    wrapper.find('form').simulate('submit');

    await wait();

    // query the user out of the Apollo client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });

    expect(user.data.me).toMatchObject(me);
  });
});
