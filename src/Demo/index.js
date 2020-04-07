import React, { Component } from 'react';
import axios from "../axios";
import url from "../api";
import { FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './index.scss'
import random from "./random.png";
import { Input, List, Button, Pagination, Tooltip, message, Popconfirm, Modal } from "antd";
const { Search } = Input


Array.prototype.update = function (index, updateObj) {
  this[index] = updateObj
  return this;
}

// 通过id找树节点
const findNodeById = (list, id) => {
  let node = null
  const run = (list = [], id) => {
    return list.every(item => {
      if (item.id === id) {
        node = { ...item }
        return false;
      }
      if (item.format) {
        return run(item.format, id);
      }
      return true;
    })
  }
  run(list, id)
  return node;
}
// 更新树
const updateTree = (list, update) => {
  const run = (list = [], update) => {
    return list.every((item, index) => {
      if (item.id === update.id) {
        list.update(index, update)
        return false;
      }
      if (item.format) {
        return run(item.format, update);
      }
      return true;
    })
  }
  run(list, update)
}

// 删除列表中不需要的key
const deleteKey = (list = [], keys = []) => {
  const run = (list, keys) => {
    list.forEach(item => {
      keys.forEach(key => {
        delete item[key]
      })
      if (item.format) {
        run(item.format, keys)
      }
    })
  }
  run(list, keys)
  return list;
}


class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [], // 操作数据列表 
      currentItem: {}, // 当前操作对象  
      sortNum: 1, // 最外层list的排序
      listData: [], // 服务端请求的列表
      selectedList: [], // 选中的列表 
      showMenu: false, //鼠标右键控制
      pageX: 0, // 记录右键位置
      pageY: 0, // 记录右键位置
      rightCurrent: {}, // 当前右键的对象
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      }, // 分页器
      keywords: '', // 搜索关键字 
      insertText: '', // 插入的文本
    }
  }
  timer = null
  componentDidMount() {
    this.getWordsList()
    this.domList.oncontextmenu = e => false;
    document.addEventListener('click', this.click)
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.click)
  }
  // 初始化列表
  initList = () => {
    let { currentItem, sortNum } = this.state
    let list = []
    if (currentItem.data) {
      list = currentItem.data.format
      sortNum = currentItem.data.sortNum
    } else {
      list = currentItem.text.trim().replace(/\s/g, '').split('').map((item, index) => {
        return {
          id: Date.now() + index,
          text: item
        }
      })
      sortNum = 1
    }
    this.setState({ list, sortNum })
  }
  // 监听页面点击事件
  click = (e) => {
    let boo = e.target.classList.contains('right-item')
    if (!boo) {
      this.closeMuen()
    }
  }
  // 双击拆分
  onDoubleClick = (current) => {
    let { list } = this.state
    if (!current.parentId) {
      // 没有父级 是最外层
      this.splitOuter(current)
      return;
    }
    // 有父级
    let parent = findNodeById(list, current.parentId)
    let newParent = this.splitCurrentAndMerge(current, parent)
    updateTree(list, newParent)
    this.setState(({ list }))
  }
  // 拆current 合并到parent
  splitCurrentAndMerge = (current, parent) => {
    let index = parent.format.findIndex(item => item.id === current.id)
    current.format.forEach(item => {
      item.parentId = parent.id
    })
    parent.format.splice(index, 1, ...current.format)
    return parent;
  }
  // 合并
  merge = () => {
    let { list, selectedList } = this.state
    if (!selectedList.length) return;
    let id = Date.now()
    let mergedObj = {
      id,
      format: [...selectedList],
      selected: false,
      sortNum: 1,
    }
    if (mergedObj.format[0].parentId) {
      let parent = findNodeById(list, mergedObj.format[0].parentId)
      let insertIndex = parent.format.findIndex(item => item.id === mergedObj.format[0].id)
      mergedObj.parentId = mergedObj.format[0].parentId
      parent.format[insertIndex] = mergedObj
      parent.format = this.deleteItem(parent.format, mergedObj)
      updateTree(list, parent)
    } else {
      let insertIndex = list.findIndex(item => item.id === mergedObj.format[0].id)
      list[insertIndex] = mergedObj
      list = this.deleteItem(list, mergedObj)
    }
    mergedObj.format.forEach(item => {
      item.selected = false
      item.parentId = id
    })
    this.setState({
      list,
      selectedList: []
    })
  }
  // 数据中删除多余的合并项
  deleteItem = (list, mergedObj) => {
    // 只合并一个 不需要删除直接返回list
    if (mergedObj.format.length === 1) return list;
    let ids = mergedObj.format.map(item => item.id)
    ids.splice(0, 1)
    ids.forEach(id => {
      let index = list.findIndex(item => item.id === id)
      list.splice(index, 1)
    })
    return list;
  }
  // 点击外层拆分
  splitOuter = (splitObj) => {
    let { list } = this.state
    list = list.map(item => {
      item.selected = false
      return { ...item }
    })
    splitObj.format.forEach(item => {
      delete item.parentId
    })
    const index = list.findIndex(item => item.id === splitObj.id)
    list.splice(index, 1, ...splitObj.format)
    this.setState({
      list,
      selectedList: []
    })
  }
  // 格式化数据
  format = () => {
    let { list, sortNum } = this.state
    if (!list.length) return message.error('数据为空');
    let newList = JSON.parse(JSON.stringify(list))
    newList = deleteKey(newList, ['selected'])
    let result = {
      sortNum,
      format: newList
    }
    return result;
  }
  // 点击设置选中状态
  selectItem = (current) => {
    let { list, selectedList } = this.state
    current.selected = !current.selected
    let parent = {}
    if (!current.parentId) {
      // 没有父级 是最最外层 
      parent = current
    } else {
      // 不是最外层 找父级
      parent = findNodeById(list, current.parentId)
      if (!parent) return;
      let index = parent.format.findIndex(item => item.id === current.id)
      parent.format[index] = current
    }
    updateTree(list, parent)
    // 判断选中列表中是否有当前选中项
    let hasIndex = selectedList.findIndex(item => item.id === current.id)
    if (hasIndex !== -1) {
      // 原来的选中列表包含了当前点击 那么此次点击一定是改为取消选中
      selectedList.splice(hasIndex, 1)
    } else {
      // 不在原来的列表中 进一步判断是否跟选中列表同级 
      let flag = !selectedList.length // 没有选中的列表 判断为同级 有长度后面会继续判断  
      if (current.parentId && selectedList.length && selectedList[0].parentId) {
        // 都存在parentId 判断是否同级
        flag = selectedList.some(item => item.parentId === current.parentId)
      } else if (selectedList.length && !selectedList[0].parentId && !current.parentId) {
        // 都不存在parentId 是最外层 是同级
        flag = true
      } else if (selectedList.length && selectedList[0].parentId && !current.parentId) {
        // 有选中的列表 选中列表有父级 当前没有父级 为不同级
        flag = false
      } else if (selectedList.length && !selectedList[0].parentId && current.parentId) {
        // 选中的列表没有父级为最外层 当前选中有父及时 为不同级 
        flag = false
      }
      if (flag) {
        // 同级
        selectedList.push(current)
      } else {
        // 不是同级 需要先把原来的选中改为false 不是同级选中列表一定存在被选中的 
        if (selectedList[0].parentId) {
          let oldParent = findNodeById(list, selectedList[0].parentId)
          oldParent.format.forEach(item => {
            item.selected = false
          })
          updateTree(list, oldParent)
        } else {
          selectedList.forEach(item => {
            item.selected = false
            let index = list.findIndex(child => child.id === item.id)
            list[index] = { ...item }
          })
        }
        selectedList = [current]
      }
    }
    this.setState({ list, selectedList })
  }
  // 鼠标右键
  onContextMenu = (e, current) => {
    const { list } = this.state
    if (!list.length) return;
    this.setState({
      pageX: e.pageX,
      pageY: e.pageY,
      showMenu: true,
      rightCurrent: current,
    })
  }
  // 渲染子节点
  renderDOM = (item) => {
    const { selectedList, list } = this.state
    if (!item.format) return item.text
    const run = (item) => {
      let isWrap = list.findIndex(child => child.id === item.id)
      return (
        <div
          key={item.id}
          className={`merge ${item.selected ? 'selected' : ''} ${isWrap !== -1 ? 'no-margin' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            this.selectItem(item)
          }}
          selfid={item.id}
          zindex={item.zIndex}
          onDoubleClick={e => {
            e.stopPropagation()
            this.onDoubleClick(item)
          }}
          onContextMenu={e => {
            e.stopPropagation()
            this.onContextMenu(e, item)
          }}
        >
          {
            !item.sortNum && <img src={random} alt="sortNum" className='sortNum' />
          }
          {
            selectedList.length !== 0 && item.selected && <span className='action merge-anction' onClick={e => {
              e.stopPropagation()
              this.merge()
            }}>合并</span>
          }
          {
            item.format && item.format.map(children => {
              if (children.format && children.format.length) {
                return run(children)
              } else {
                return (
                  <div
                    key={children.id}
                    selfid={children.id}
                    className={`item ${children.selected ? 'selected' : 'item-in'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      this.selectItem(children)
                    }}
                  >
                    {children.text}
                    {
                      selectedList.length !== 0 && children.selected && <span className='action merge-anction' onClick={e => {
                        e.stopPropagation()
                        this.merge()
                      }}>合并</span>
                    }
                  </div>
                )
              }
            })
          }
        </div>
      )
    }
    let res = run(item);
    return res
  }
  // 关闭右键盘排序
  closeMuen = () => {
    this.setState({ showMenu: false })
  }
  // 点击右键菜单
  clickMenuItem = (e, value) => {
    e.stopPropagation()
    const { rightCurrent, list } = this.state
    if (!rightCurrent) {
      this.setState({
        sortNum: value
      })
      this.closeMuen()
      return;
    }
    rightCurrent.sortNum = value
    let index = list.findIndex(item => item.id === rightCurrent.id)
    if (index !== -1) {
      list[index] = rightCurrent
      this.setState({ list })
      this.closeMuen()
      return;
    }
    let parent = findNodeById(list, rightCurrent.parentId)
    updateTree(list, parent)
    this.setState({ list })
    this.closeMuen()
  }
  // 改变拆分语句输入框回调
  onChange = (e) => {
    this.setState({
      insertText: e.target.value
    })
  }
  // 点击列表的文字
  onClickListItem = (item) => {
    this.setState({
      currentItem: item,
      insertText: item.text,
    }, this.initList)
  }
  // 保存操作
  savaAction = () => {
    const data = this.format()
    console.log(JSON.stringify(data, (k, v) => v, 4));
    const { currentItem } = this.state
    axios.put(url.editWords, {
      data,
      text: currentItem.text,
    }).then(res => {
      if (!res.data.isSuccess) return message.error('保存失败');
      message.success('保存成功')
      this.setState({
        insertText: '',
        list: [],
        currentItem: {},
      }, this.getWordsList)
    })
  }
  // 点击插入
  insertText = () => {
    const { insertText } = this.state
    axios.post(url.addWords, {
      text: insertText,
      data: null
    }).then(res => {
      if (!res.data.isSuccess) return message.error('插入失败');
      message.success('插入成功')
      this.setState({
        insertText: '',
        list: [],
        currentItem: {},
      }, this.getWordsList)
    })
  }
  // 搜索框搜索
  onSearch = (value) => {
    const { pagination } = this.state
    this.setState({
      keywords: value,
      pagination: {
        ...pagination,
        current: 1,
      },
      list: [],
      currentItem: {},
      insertText: ''
    }, this.getWordsList)
  }
  // 分页器
  onPageChange = (page, pageSize) => {
    const { pagination } = this.state
    this.setState({
      pagination: {
        ...pagination,
        current: page
      },
      list: [],
      insertText: '',
      currentItem: {},
    }, this.getWordsList)
  }
  // 分页器
  onShowSizeChange = (current, size) => {
    const { pagination } = this.state
    this.setState({
      pagination: {
        ...pagination,
        current: 1,
        pageSize: size,
      },
      list: [],
      insertText: '',
      currentItem: {},
    }, this.getWordsList)
  }
  // 获取文本列表
  getWordsList = () => {
    const { keywords, pagination } = this.state
    axios.post(url.getWordsList, {
      keyword: keywords,
      pageSize: pagination.pageSize,
      pageNum: pagination.current
    }).then(res => {
      if (!res.data.isSuccess) return message.error(res.data.errorMsg)
      this.setState({
        listData: res.data.data,
        pagination: {
          ...pagination,
          total: res.data.pagination.totalCount * 1
        }
      })
    })
  }
  // 删除
  delelteItem = item => {
    const { pagination } = this.state 
    let newCurrent = 1
    if(pagination.current !== 1){
      newCurrent = pagination.total % ((pagination.current - 1) * pagination.pageSize) 
    } 
    axios.post(url.delWords, {
      text: item.text,
    }).then(res => {
      if (!res.data.isSuccess) return message.error(res.data.errorMsg)
      message.success('删除成功')
      this.setState({
        list: [],
        insertText: '',
        currentItem: {},
        pagination: {
          ...pagination,
          current: newCurrent
        }
      }, this.getWordsList)
    })
  }
  resetList = () => {
    Modal.confirm({
      title: '提示',
      content: `确定重置?`,
      okText: '确定',
      cancelText: '取消',
      style: {top: 200},
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        const { currentItem } = this.state
        let list = currentItem.text.trim().replace(/\s/g, '').split('').map((item, index) => {
          return {
            id: Date.now() + index,
            text: item
          }
        })
        this.setState({list, sortNum: 1})
      }
    }); 
  }
  render() {
    const {
      list,
      listData,
      showMenu,
      pageX,
      pageY,
      rightCurrent,
      selectedList,
      insertText,
      pagination,
      sortNum,
      currentItem,
      keywords,
    } = this.state

    return (
      <div className='demo'>
        <div className='words-wrap'>
          <div className="words-search">
            <div className='s-left'>
              <Search
                allowClear
                style={{ width: 320 }}
                placeholder="请输入筛选文字"
                value={keywords}
                onChange={e => {
                  this.setState({
                    keywords: e.target.value
                  })
                }}
                onSearch={this.onSearch}
              />
            </div>
            <div className="s-right">
              <Pagination
                {...pagination}
                showQuickJumper
                showSizeChanger
                onChange={this.onPageChange}
                onShowSizeChange={this.onShowSizeChange}
              />
            </div>
          </div>
          <div className="words-list">
            <List
              style={{ 
                maxHeight: '405px',
                overflowY: 'auto'
              }}
              bordered
              dataSource={listData}
              renderItem={(item, index) => (
                <div
                  key={index}
                  className={`list-item ${item.text === currentItem.text ? 'item-selected' : ''}`}
                  onClick={() => this.onClickListItem(item)}
                >
                  <div className='item-icon'>
                    {
                      item.data && (
                        <Tooltip title='已操作'>
                          <FormOutlined style={{ color: '#52c41a' }} />
                        </Tooltip>
                      )
                    }
                  </div>
                  <div className='text-content'>
                    {item.text}
                  </div>
                  <div className='del-con'>
                    <Popconfirm title='确定删除？' onClick={e => e.stopPropagation()} onConfirm={() => this.delelteItem(item)}>
                      <DeleteOutlined style={{ color: 'red' }} />
                    </Popconfirm>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
        <div className='top'>
          <Input
            value={insertText}
            onChange={this.onChange}
            placeholder='初始化数据'
          />
          <Button type='primary' style={{ marginLeft: '20px' }} onClick={this.insertText}>插入</Button>
        </div>
        <div
          className="list"
          ref={e => this.domList = e}
          onContextMenu={e => {
            e.stopPropagation()
            this.onContextMenu(e)
          }}
        >
          {
            !sortNum && <img src={random} alt="sortNum" className='sortNum' />
          }
          {
            list.map(item => (
              <div
                key={item.id}
                selfid={item.id}
                className={`item ${!item.format && item.selected ? 'selected' : 'item-in'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault();
                  this.selectItem(item)
                }}
                onDoubleClick={e => {
                  e.stopPropagation()
                  if (item.format) {
                    this.onDoubleClick(item)
                  }
                }}
                onContextMenu={e => {
                  e.stopPropagation()
                  if (item.format) {
                    this.onContextMenu(e, item)
                  }
                }}
              >
                {
                  this.renderDOM(item)
                }
                {
                  item.selected && selectedList.length !== 0 && !item.format && (
                    <span
                      className='action merge-anction'
                      onClick={e => {
                        e.stopPropagation()
                        this.merge()
                      }}
                    >合并</span>
                  )
                }
              </div>
            ))
          }
        </div>
        <div className="action-btns">
          {
            currentItem.text && <Button onClick={this.resetList} style={{ marginRight: '15px' }}>重置</Button>
          } 
          <Button type='primary' onClick={this.savaAction}>保存</Button>
        </div>
        {
          showMenu && (
            <div className='right' style={{ top: pageY + 5, left: pageX + 5 }}>
              <div
                className={`right-item ${(rightCurrent ? rightCurrent.sortNum : sortNum) === 1 ? 'right-item-selected' : ''}`}
                onClick={e => this.clickMenuItem(e, 1)}
              >有序</div>
              <div
                className={`right-item ${(rightCurrent ? rightCurrent.sortNum : sortNum) === 0 ? 'right-item-selected' : ''}`}
                onClick={e => this.clickMenuItem(e, 0)}
              >无序</div>
            </div>
          )
        }
      </div>
    );
  }
}

export default Demo;