import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 5000,
  description: 'This item is really cool!',
  image: 'image.jpg',
  largeImage: 'largeImg.jpg'
};

describe('<Item />', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
