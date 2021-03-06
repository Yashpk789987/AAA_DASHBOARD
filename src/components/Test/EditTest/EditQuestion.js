import React from 'react';
import { baseurl, endurl, fileurl } from '../../../baseurl';
import { Form, Input, Button, Row, Col } from 'antd';
import { encoded_data } from '../../../encoded_data';
import Alert from '../../Alert';

const { TextArea } = Input;

export default class EditQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      english_text: '',
      hindi_text: '',
      formLayout: 'horizontal',
      options: [],
      correct_option_index: null,
      question_id: '',
      pic: null,
      pic_url: null,
      UploadingData: false,
      showModal: false,
      modal_title: '',
      modal_message: ''
    };
  }

  componentDidMount() {
    const { question } = this.props;
    this.setState({
      question_id: question.test_question_id,
      english_text: question.english_text,
      hindi_text: question.hindi_text,
      options: question.test_options,
      correct_option_index: question.correct_option_index,
      pic_url: question.pic
    });
  }

  makeShowModalFalse = () => {
    this.setState({ showModal: false, UploadingData: false });
  };

  validateForm = () => {
    let validateOptions = () => {
      for (let i = 0; i < this.state.options.length; i++) {
        if (this.state.options[i].option_english_text === '') {
          return false;
        }
      }
      return true;
    };
    const { english_text, correct_option_index, options } = this.state;
    if (english_text === '') {
      this.setState({
        showModal: true,
        modal_title: 'Requirements',
        modal_message: 'Please Type The Question'
      });
      return false;
    } else if (options.length === 0) {
      this.setState({
        showModal: true,
        modal_title: 'Requirements',
        modal_message: 'Please Make Options'
      });
      return false;
    } else if (validateOptions() === false) {
      this.setState({
        showModal: true,
        modal_title: 'Requirements',
        modal_message: 'Please Fill All The Options'
      });
      return false;
    } else if (correct_option_index === 0) {
      this.setState({
        showModal: true,
        modal_title: 'Requirements',
        modal_message: 'Please Fill Correct Option Field'
      });
      return false;
    } else if (
      correct_option_index > options.length ||
      correct_option_index < 1
    ) {
      this.setState({
        showModal: true,
        modal_title: 'Requirements',
        modal_message: 'Invalid Option'
      });
      return false;
    } else {
      return true;
    }
  };

  handleChange = event => {
    let found = false;
    for (let i = 0; i < encoded_data.length; i++) {
      if (event.target.value.indexOf(encoded_data[i].name) !== -1) {
        found = true;
        this.setState({
          [event.target.name]: event.target.value.replace(
            encoded_data[i].name,
            encoded_data[i].js_code
          )
        });
        break;
      }
    }
    if (!found) {
      this.setState({ [event.target.name]: event.target.value });
    }
  };

  handleOptionChange = (index, event) => {
    event.persist();
    let object = {};
    let found = false;
    for (let i = 0; i < encoded_data.length; i++) {
      if (event.target.value.indexOf(encoded_data[i].name) !== -1) {
        found = true;
        object = Object.assign(this.state.options[index], {
          [event.target.name]: event.target.value.replace(
            encoded_data[i].name,
            encoded_data[i].js_code
          )
        });
        break;
      }
    }
    if (!found) {
      if (event.target.name === 'option_english_text') {
        object = Object.assign(this.state.options[index], {
          [event.target.name]: event.target.value,
          option_hindi_text: event.target.value
        });
      } else {
        object = Object.assign(this.state.options[index], {
          [event.target.name]: event.target.value
        });
      }
    }
    this.setState(state => ({ [state.options[index]]: object }));
  };

  handleSelectChange = value => {
    this.setState({ sub_category_id: value });
  };

  handleSubmit = e => {
    if (this.validateForm() === true) {
      let custome_url = `tests/update_test_question_without_image/${endurl}`;
      this.setState({ UploadingData: true });
      let formData = new FormData();
      const sendData = {
        question_id: this.state.question_id,
        english_text: this.state.english_text,
        hindi_text: this.state.hindi_text,
        options: this.state.options,
        correct_option_index: this.state.correct_option_index
      };
      formData.append('SendData', JSON.stringify(sendData));
      if (this.state.pic !== null) {
        custome_url = `tests/update_test_question_with_image/${endurl}`;
        formData.append('question_image', this.state.pic);
      }
      fetch(baseurl + custome_url, {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'success') {
            this.setState({
              UploadingData: false,
              showModal: true,
              modal_title: 'Confirmation',
              modal_message: 'Question Updated Successfully'
            });
          } else {
            this.setState({
              UploadingData: false,
              showModal: true,
              modal_title: 'Error',
              modal_message: 'Server Error'
            });
          }
        })
        .catch(err => {
          this.setState({
            showModal: true,
            modal_title: 'Server Error',
            modal_message: 'Please Contact To Technical Team'
          });
          console.log(err);
        });
    } else {
    }
  };

  handleFile = e => {
    this.setState({ pic: e.target.files[0] });
  };

  handleAppendButton = () => {
    const newOption = {
      english_text: '',
      hindi_text: '',
      question_id: ''
    };
    this.setState(state => ({
      options: state.options.concat(newOption)
    }));
  };

  render() {
    const { formLayout } = this.state;
    const formItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 }
          }
        : null;
    const buttonItemLayout =
      formLayout === 'horizontal'
        ? {
            wrapperCol: { span: 14, offset: 4 }
          }
        : null;

    return (
      <div className='box'>
        <hr />
        <Form
          layout={formLayout}
          action='#'
          method='post'
          encType='multipart/form-data'
        >
          <Form.Item label='Question' {...formItemLayout}>
            <Row>
              <Col span={10}>
                <TextArea
                  name='english_text'
                  value={this.state.english_text}
                  rows={4}
                  placeholder='In English'
                  onChange={this.handleChange}
                />
              </Col>
              <Col span={10} offset={1}>
                <TextArea
                  name='hindi_text'
                  value={this.state.hindi_text}
                  rows={4}
                  placeholder='In Hindi'
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
          </Form.Item>
          <div style={{ padding: '5%' }}>
            <Row>
              <Col>
                {this.state.pic_url === null ? (
                  <></>
                ) : (
                  <img
                    alt='Failed T Load'
                    src={`${baseurl}${fileurl}/questions/${this.state.pic_url}`}
                  />
                )}
              </Col>
            </Row>
          </div>
          <br />
          <br />
          {this.state.options.map((option, index) => {
            return (
              <QuestionOption
                key={index}
                option={option}
                index={index}
                handleOptionChange={this.handleOptionChange}
                removeOption={this.removeOption}
              />
            );
          })}
          <Form.Item label='Correct Option' {...formItemLayout}>
            <Input
              type={`number`}
              max={this.state.options.length}
              min={1}
              value={this.state.correct_option_index}
              onChange={this.handleChange}
              name='correct_option_index'
            />
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            Attach Image &nbsp; : &nbsp;&nbsp;&nbsp;
            <Button type='primary'>
              <label for='upload-photo' style={{ paddingTop: '5%' }}>
                Browse File
              </label>
              <input
                type='file'
                id='upload-photo'
                onChange={e => this.handleFile(e)}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  zIndex: -1
                }}
              />
            </Button>
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            <Button
              type='primary'
              loading={this.state.UploadingData}
              onClick={this.handleSubmit}
            >
              Update Question
            </Button>
          </Form.Item>
        </Form>
        {this.state.showModal === true ? (
          <Alert
            makeShowModalFalse={this.makeShowModalFalse}
            title={this.state.modal_title}
            message={this.state.modal_message}
          />
        ) : (
          <></>
        )}
      </div>
    );
  }
}

class QuestionOption extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formLayout: 'horizontal'
    };
  }
  componentDidMount() {}

  render() {
    const { formLayout } = this.state;
    const formItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 }
          }
        : null;
    return (
      <Form.Item label={`Option ${this.props.index + 1}`} {...formItemLayout}>
        <Row>
          <Col span={10}>
            <Input
              value={this.props.option.option_english_text}
              size='large'
              name='option_english_text'
              placeholder='Type In English'
              onChange={event =>
                this.props.handleOptionChange(this.props.index, event)
              }
            />
          </Col>
          <Col span={10} offset={1}>
            <Input
              value={this.props.option.option_hindi_text}
              size='large'
              name='option_hindi_text'
              placeholder='Type In Hindi'
              onChange={event =>
                this.props.handleOptionChange(this.props.index, event)
              }
            />
          </Col>
        </Row>
      </Form.Item>
    );
  }
}
