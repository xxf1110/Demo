import React, { Component } from 'react';
import './index.scss'


class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          id: 0,
          text: '向'
        },
        {
          id: 1,
          text: '我'
        },
        {
          id: 2,
          text: '你'
        },
        {
          id: 3,
          text: '他'
        },
        {
          id: 4,
          text: '小'
        },
        {
          id: 5,
          text: '飞'
        },
        {
          id: 6,
          text: '李'
        },
        {
          id: 7,
          text: '王'
        },
        {
          id: 8,
          text: '二'
        },
        {
          id: 9,
          text: '张'
        },
        {
          id: 11,
          text: '赵'
        },
        {
          id: 12,
          text: '马'
        },
        {
          id: 13,
          text: '王'
        },
        {
          id: 14,
          text: '晓'
        },
        {
          id: 15,
          text: '三'
        },
        {
          id: 16,
          text: '二'
        },
        {
          id: 17,
          text: '五'
        },
        {
          id: 18,
          text: '六'
        },
      ],
      selectedList: [], // 选中的列表
      result: {}, // 格式化的数据 
    }
  }
  clickItem = (item) => {
    let { list } = this.state
    list = this.mapList(list, item.id)
    const selectedList = this.eachList(list)
    this.setState({
      selectedList,
      list,
    })
  }
  // 点击合并 
  mergeSelected = (e) => {
    e.stopPropagation()
    let { list, selectedList } = this.state
    if (selectedList.length >= 2) {
      let mergeObj = this.merge(selectedList)
      list = this.replace(list, mergeObj)
      let ids = selectedList.map(item => item.id)
      // ids.splice(0, 1)
      list = this.delelteItem(list, ids)
    }
    this.setState({
      list,
      selectedList: []
    })
  }
  // 鼠标悬浮
  onMouseOver = (item) => {
    if (!item.isMerged) return;
    this.setHover(item, true)
  }
  // 鼠标移入
  onMouseEnter = (item) => {
    if (!item.isMerged) return;
    this.setHover(item, true)
  }
  // 鼠标移出
  onMouseLeave = (item) => {
    if (!item.isMerged) return;
    this.setHover(item, false)
  }
  // 显示拆分
  setHover = (hoverItem, boo) => {
    const { list } = this.state
    let index = list.findIndex(item => item.id === hoverItem.id)
    list[index].hovered = boo
    this.setState({ list })
  }
  // 遍历list 设置选中状态
  mapList = (list, id) => {
    list = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          selected: !item.selected,
        }
      }
      return {
        ...item,
      }
    })
    return list;
  }
  // 遍历list 找出选中的 
  eachList = (list) => {
    return list.filter(item => item.selected)
  }
  // 合并
  merge = (selectedList) => {
    let len = selectedList.length
    let res = {
      id: selectedList[0].id,
      format: [...selectedList],
      selected: false,
      isMerged: true,
      text: (
        <div className='merge'>
          {
            selectedList.map((item, index) => (
              <div className='item' key={index} >{item.text}</div>
            ))
          }
        </div>
      ),
    }
    if (len === 2) {
      res = {
        ...res,
        left: selectedList[0],
        right: selectedList[1],
      }
    } else {
      res = {
        ...res,
        left: [...selectedList],
        right: null,
      }
    } 
    return res
  }
  // 将合并的对象进行替换  
  replace = (list, mergeObj) => {
    let index = list.findIndex(item => item.id === mergeObj.id)
    list[index] = mergeObj
    return list;
  }
  //替换后从数据中删除多余的
  delelteItem = (list, ids) => {
    let indexes = []
    ids.splice(0, 1)
    ids.map(id => {
      let index = list.findIndex(item => item.id === id)
      indexes.push(index)
    }) 
    for (let i = indexes.length - 1; i >= 0; i--) {
      list.splice(indexes[i], 1)
    }
    return list;
  }
  // 点击拆分
  clickSplit = (e, splitObj) => {
    e.stopPropagation()
    let { list } = this.state
    const index = list.findIndex(item => item.id === splitObj.id)
    if (splitObj.format.length > 2) {
      const left = this.split(splitObj)
      list = this.inset(list, left, null, index)
    } else {
      const [left, right] = this.split(splitObj)
      list = this.inset(list, left, right, index)
    }
    this.setState({ list })
  }
  // 拆分 
  split = (splitObj) => {
    if (!splitObj.isMerged) return;
    if (splitObj.format.length > 2) {
      return [...splitObj.left]
    } else {
      return [splitObj.left, splitObj.right]
    }
  }
  // 拆分后插入
  inset = (list, left, right, index) => {
    if (left.length > 2) {
      left.forEach(item => {
        item.selected = false
        item.selected = false
      })
      list.splice(index, 1, ...left)
    } else {
      left.selected = false
      right.selected = false
      list.splice(index, 1, left, right)
    }
    return list;
  }
  // 格式化数据
  formatList = () => {
    let { list } = this.state
    let result = JSON.parse(JSON.stringify(list)) 
    result.forEach(item => {
      item = this.deleteKey(item)
      if (Array.isArray(item.format)) { 
        item.format = this.extend(item.format)
      }
    }) 
    if(result.length === 1){
      result = result.pop()
    }else{
      result = {
        disorder: false,
        list: [...result]
      }
    }
    this.setState({
      result,
    })
  }

  // 删除key value
  deleteKey = (item = {}) => {
    if (typeof item.text !== 'string') {
      delete item.text
    } 
    delete item.selected
    delete item.isMerged
    delete item.hovered
    delete item.left
    delete item.right
    if (item.format) {
      item.format = this.extend(item.format)
    }
    return { ...item }
  }
  // 递归删除内层key vlaue
  extend = (format = []) => {
    format = format.map(item => {
      item = this.deleteKey(item)
      return item;
    })
    return format;
  }
  sort = (e, item) => {
    e.stopPropagation()
    if (!item.isMerged) return;
    item.disorder = !item.disorder
    const { list } = this.state
    const index = list.findIndex(listItem => listItem.id === item.id)
    list[index] = item
    this.setState({ list })
  }
  render() {
    const { list, selectedList, result } = this.state
    const selectedLen = selectedList.length
    return (
      <div className='demo'>
        <div className="list">
          {
            list.map(item => (
              <div
                key={item.id}
                className={`item ${item.selected ? 'selected' : ''}`}
                onMouseOver={() => this.onMouseOver(item)}
                onMouseEnter={() => this.onMouseEnter(item)}
                onMouseLeave={() => this.onMouseLeave(item)}
                onClick={() => this.clickItem(item)}
              >
                {item.text}
                {
                  selectedLen >= 2 && item.selected && <span className='action merge' onClick={e => this.mergeSelected(e)}>合并</span>
                }
                {
                  item.hovered && item.isMerged && <span className='action split' onClick={e => this.clickSplit(e, item)}>拆分</span>
                }
                {
                  item.hovered && item.isMerged && <span className='action sort' onClick={e => this.sort(e, item)}>{item.disorder ? '无序' : '有序'}</span>
                }
              </div>
            ))
          }
        </div>
        <div className="action-btns">
          <a onClick={() => this.formatList([], this.state.list)}>格式化数据</a>
        </div>
        <pre className='content'>
          <pre>
            {JSON.stringify(result, (k, v) => v, 4)}
          </pre>
        </pre>
      </div>
    );
  }
}

export default Demo;