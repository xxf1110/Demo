import React, { Component } from 'react';
import './index.scss'
import ClipboardJS from "clipboard";
import $ from 'jquery'
import random from "./random.png";

 
Array.prototype.update = function (index, updateObj) {
  this[index] = updateObj
  return this;
}


function findById(list, id) {
  const run = (arr = [], id, res = []) => {
    if (!arr.length) return arr;
    let filters = arr.filter(item => item.id === id)
    if (filters.length) {
      return res.concat(...filters)
    } else {
      res = arr.map(item => {
        if (item.format) {
          return run(item.format, id, res)
        }
        return [];
      })
      return res;
    }
  }
  let currentArr = run(list, id, [])
  currentArr = currentArr.flat(Infinity)
  let current = currentArr[0]
  return current
}

function updateList(list, replace) {
  const eachTree = (list) => {
    list.map((item, index) => {
      if (item.id === replace.id) {
        list.update(index, replace)
      } else {
        if (item.format) {
          eachTree(item.format)
        }
      }
    })
  }
  eachTree(list)
}


class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [], // 数据列表
      originStr: '', // 原始字符串
      selectedList: [], // 外层选中的列表
      result: {}, // 格式化的数据 
      desc: '', // modal描述
      showModal: false, // 控制显示modal
      selectedInList: [], // 内层选中的列表
      parent: {}, //记录内层合并的父级
      showMenu: false, //鼠标右键控制
      pageX: 0, // 记录右键位置
      pageY: 0, // 记录右键位置
      rightCurrent: {} // 当前右键的对象
    }
  }
  timer = null
  componentDidMount() {
    this.initList()
    this.domList.oncontextmenu = e => false;
    let result = this.formatList()
    this.setState({ result })
    document.addEventListener('click', this.click) 
    this.clipboard = new ClipboardJS('.copy');
    this.clipboard.on('success', (e) => {
      this.openModal('拷贝成功')
      e.clearSelection();
    });
    this.clipboard.on('error', (e) => {
      this.openModal('拷贝失败')
    });
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.click)
    this.clipboard.destroy();
  }
  initList = () => {
    const { originStr } = this.state
    let list = originStr.trim().replace(/\s/g, '').split('').map((item, index) => {
      return {
        id: index,
        text: item
      }
    })
    this.setState({ list })
  }


  click = (e) => {
    let boo = e.target.classList.contains('right-item')
    if (!boo) {
      this.closeMuen()
    }
  }
  openModal = (desc) => {
    this.setState({
      desc,
      showModal: true,
    })
    this.timer = setTimeout(() => {
      this.setState({
        showModal: false,
      })
      clearTimeout(this.timer)
    }, 2000)
  } 
  clickItem = (item) => {
    let { list, selectedInList } = this.state
    if (list.length === 1) return; 
    // 点击外层内层清空选中 
    if (selectedInList.length) { 
      let insetParent = findById(list, selectedInList[0].parentId) 
      if (insetParent) {
        insetParent.format.forEach(item => {
          item.selected = false
        })
        updateList(list, insetParent)
        this.setState({
          parent: {},
          selectedInList: [],
        })
      }
    }

    list = this.mapList(list, item.id) 
    const selectedList = this.eachList(list) 
    this.setState({
      selectedList,
      list,
    })
  }
  // 点击合并 
  mergeSelected = (e) => {
    if (e) e.stopPropagation();
    let { list, selectedList } = this.state
    if (selectedList.length) {
      let mergeObj = this.merge(selectedList) 
      list = this.replace(list, mergeObj)
      list = this.delelteItem(list, mergeObj)
    }
    this.setState({
      list,
      selectedList: []
    })
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

  // 双击拆分内层
  onDoubleClick = (e, currentId) => {
    e.stopPropagation()
    let startTime = Date.now()
    console.log('-------startTime', startTime);
    const { list } = this.state 
 
    let splitId = currentId

    let id = $(e.target).parents('.item').last().attr('selfid') * 1 

    let prev = list.find(item => item.id === id)
    if (prev.id === splitId) {
      console.log(250, JSON.parse(JSON.stringify(list)))
      this.clickSplit(null, prev)
      return;
    }  
    let current = findById(list, splitId)
    let parent = {}
    if (prev.id === current.parentId) {
      parent = prev
    } else { 
      parent = findById(list, current.parentId)
    } 
    let newParent = this.splitCurrentAndMerge(current, parent) 
    if (prev.id === newParent.id) {
      let prevIndex = list.findIndex(item => item.id === id)
      list[prevIndex] = newParent 
      let newList = this.delParentId(list)
      this.setState({ list: newList })
      return;
    }
  
    updateList(list, newParent)
    let newList = this.delParentId(list)
    this.setState(({ list: newList }))
    let endTime = Date.now()
    console.log('-------endTime', endTime);
    console.log('------------------------耗时', endTime - startTime);
    return; 
  }
  // 删除delParentId
  delParentId = (list) => {
    let newList = list.map(item => {
      delete item.parentId 
      return {...item};
    })
    return newList;
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
  merge = (selectedList) => {
    let len = selectedList.length
    selectedList.forEach(item => {
      item.selected = false
    })
    let id = Date.now()
    let res = {
      id,
      format: [...selectedList],
      selected: false,
      isMerged: true,
      sortNum: 1,
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
    res.format.forEach(item => {
      item.parentId = id
    })
    return res
  }
  // 将合并的对象进行替换  
  replace = (list, mergeObj) => {
    let index = list.findIndex(item => item.id === mergeObj.format[0].id)
    list[index] = mergeObj
    return list;
  }
  //替换后从数据中删除多余的
  delelteItem = (list, mergeObj) => {
    if (mergeObj.format.length > 2) {
      let ids = mergeObj.format.map(item => item.id)
      ids.splice(0, 1)
      let indexes = []
      ids.forEach(id => {
        let index = list.findIndex(item => item.id === id)
        indexes.push(index)
      })
      for (let i = indexes.length - 1; i >= 0; i--) {
        list.splice(indexes[i], 1)
      }
    } else {
      let index = -1
      if (mergeObj.right) {
        index = list.findIndex(item => item.id === mergeObj.right.id)
      }
      if (index !== -1) {
        list.splice(index, 1)
      }
    }
    return list;
  }
  // 双击拆分内层 合并parent
  splitCore = (parent, splitId) => {
    parent.update && parent.update() 
    let newParent = JSON.parse(JSON.stringify(parent))
    let index = parent.format.findIndex(item => item.id === splitId) 
    let splitObj = JSON.parse(JSON.stringify(parent.format[index])) 

    let len = splitObj.format.length

    if (len > 2) {
      const left = splitObj.left
      newParent.format.splice(index, 1, ...left)
    } else {
      const left = { ...splitObj.left }
      const right = { ...splitObj.right }
      newParent.format.splice(index, 1, left, right)
    }
    newParent.format.forEach(item => {
      item.selected = false
      item.isMerged = false
    })
    newParent.content.selectedList.splice(index, 1, ...splitObj.content.selectedList)
 
    return newParent;
  }
  // 双击拆分插入

  // 拆分后插入
  insetParent = (parent, left, right, index) => {
    if (left.length > 2) {
      left.forEach(item => {
        item.selected = false
        item.selected = false
      })
      parent.format.splice(index, 1, ...left)
    } else {
      left.selected = false
      right.selected = false
      parent.format.splice(index, 1, left, right)
    }
    return parent;
  }
  // 点击拆分
  clickSplit = (e, splitObj) => {
    if (e) e.stopPropagation();
    let { list } = this.state
    list = list.map(item => {
      item.selected = false
      return { ...item }
    })
    const index = list.findIndex(item => item.id === splitObj.id)
    if (splitObj.format.length > 2) {
      const left = this.split(splitObj)
      list = this.inset(list, left, null, index)
    } else {
      const [left, right] = this.split(splitObj)
      list = this.inset(list, left, right, index)
    }
    let newList = this.delParentId(list)
    this.setState({ list: newList })
  }
  // 拆分 
  split = (splitObj) => {
    return [...splitObj.format]
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
      if (right) {
        right.selected = false
        list.splice(index, 1, left, right)
      } else {
        list.splice(index, 1, left)
      }

    }
    return list;
  }
  // 格式化数据
  formatList = () => {
    let { list } = this.state
    if (!list.length) return;
    let result = JSON.parse(JSON.stringify(list))
    result.map(item => {
      item = this.deleteKey(item)
      return item
    })
    if (result.length === 1) {
      result = result.pop()
    } else {
      result = {
        sortNum: 1,
        format: [...result]
      }
    }
    return result;
  }
  // 点击格式化
  format = () => {
    let { list } = this.state
    if (!list.length) return this.openModal('数据为空');
    const result = this.formatList()
    this.openModal('已格式化数据')
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
  copy = () => {
    const result = this.formatList() 
  }
  // 内层合并
  clickInItem = (childrenItem) => {
    console.log('-----------------3--------------', childrenItem);
    let { list, selectedInList, selectedList, parent } = this.state
    let isWrap = list.findIndex(item => item.id === childrenItem.id)
    console.log('--------------isWrap------', isWrap);
    if (isWrap !== -1) {
      // 是最外层  
      let wrapParent = null
      if (selectedInList.length) {
        wrapParent = findById(list, selectedInList[0].parentId)
      }
      if (wrapParent) {
        wrapParent.format.forEach(item => {
          item.selected = false
        })
        updateList(list, wrapParent)
      }
      this.setState({
        list,
        selectedInList: [],
      })
      this.clickItem(childrenItem)
      return;
    }
    let index = -1

    if (parent.format) {
      // 缓存有父级的时候
      index = parent.format.findIndex(item => item.id === childrenItem.id)

      // 点击内层清空外出选中 
      if (selectedList.length) {
        console.log('点击内层清空外出选中', 571, selectedList);
        if (selectedList[0].parentId) {
          let wrapParent = findById(list, selectedList[0].parentId)
          console.log('wrapParent', wrapParent);
          if (wrapParent) {
            wrapParent.format.forEach(item => {
              item.selected = false
            })
            updateList(list, wrapParent)
            this.setState({
              selectedList: [],
            })
          }
        }
        list.forEach(item => {
          item.selected = false
        })
      }
      // 判断当前点击是否在原来的父级里面
      if (index === -1) {
        // 不在原来的父级里面 相当于第一次点击操作 需要清空之前设置状态值
        parent.format.forEach(item => item.selected = false)
        updateList(list, parent)

        parent = findById(list, childrenItem.parentId)
        console.log('parent', parent)
        // 父级只有两个直接返回 
        if (!parent || !parent.format) return;
        if (parent.format.length === 2) {
          // 此处有bug 
          // parent.selected = true;
          // console.log(609, JSON.parse(JSON.stringify(parent)));
          // updateList(list, parent)
          // this.setState({list})
          return;
        };
        childrenItem.selected = !childrenItem.selected
        let i = parent.format.findIndex(item => item.id === childrenItem.id)
        parent.format[i] = childrenItem
        selectedInList = parent.format.filter(item => item.selected)
        // 更新list
        updateList(list, parent)
        // childrenItem.selected = !childrenItem.selected
        // selectedInList = parent.format.filter(item => item.selected)
        console.log('当前点击不在原来的父级里面');
        this.setState({
          list,
          parent,
          selectedInList,
        })
      } else {
        childrenItem.selected = !childrenItem.selected
        if (selectedInList.length === parent.format.length - 1 && childrenItem.selected) {
          childrenItem.selected = false
          this.openModal(`最多只能选择${parent.format.length - 1}个`)
          return;
        }
        let i = parent.format.findIndex(item => item.id === childrenItem.id)
        parent.format[i] = childrenItem
        selectedInList = parent.format.filter(item => item.selected)
        // 更新list
        updateList(list, parent)
        console.log(593, JSON.parse(JSON.stringify(list)));
        this.setState({
          list,
          parent,
          selectedInList,
        })
      }
    } else {
      // 没有父级第一次点击 记录新的父级
      parent = findById(list, childrenItem.parentId)
      if (!parent) return;

      // 点击内层一个的时候 暂不操作
      if (parent.format.length === 1) return;
 
      // 父级只有两个直接返回
      if (parent.format.length === 2) {
        // 此处有bug 
        // parent.selected = true; 
        // updateList(list, parent) 
        // this.setState({list})
        return;
      }  

      childrenItem.selected = !childrenItem.selected
      selectedInList = parent.format.filter(item => item.selected)
      // 更新list
      updateList(list, parent)

      // 点击内层清空外出选中 
      if (selectedList.length) {
        if (selectedList[0].parentId) { 
          let wrapParent = findById(list, selectedList[0].parentId)
          if (wrapParent) { 
            let wrapParent = findById(list, selectedList[0].parentId) 
            wrapParent.format.forEach(item => {
              item.selected = false
            })
            updateList(list, wrapParent)
            this.setState({
              selectedList: [],
            })
          }
        }
        list.forEach(item => {
          item.selected = false
        }) 
      }

      this.setState({
        list,
        parent,
        selectedInList,
      })
    }
  }
  mergeSelectedInside = (e) => {
    e.stopPropagation()
    let { list, parent, selectedInList } = this.state
 
    let res = this.merge(selectedInList)
    res.parentId = parent.id 
    // 记录插入的位置
    let insertIndex = parent.format.findIndex(item => item.id === selectedInList[0].id)
    selectedInList.forEach(item => {
      let delIndex = parent.format.findIndex(children => children.id === item.id)
      if (delIndex !== -1) {
        if (insertIndex === delIndex) {
          parent.format.splice(delIndex, 1, res)
        } else {
          parent.format.splice(delIndex, 1)
        }
      }
    }) 

    // 更新list
    updateList(list, parent)
    this.setState({
      list,
      parent: {},
      selectedInList: [],
    })
  }
  onContextMenu = (e, current) => {
    let x = e.pageX
    let y = e.pageY
    this.setState({
      showMenu: true,
      pageX: x,
      pageY: y,
      rightCurrent: current
    })
  }
  renderDOM = (item) => {
    const { selectedInList, list } = this.state
    if (!item.format) return item.text
    const run = (item) => {
      let isWrap = list.findIndex(child => child.id === item.id)
      return (
        <div
          key={item.id}
          className={`merge ${item.selected ? 'selected' : ''} ${isWrap !== -1 ? 'no-margin' : ''}`}
          onClick={(e) => {
            e.stopPropagation() 
            this.clickInItem(item)
          }}
          selfid={item.id}
          zindex={item.zIndex}
          onDoubleClick={e => {
            e.stopPropagation()
            this.onDoubleClick(e, item.id)
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
            selectedInList.length >= 2 && item.selected && <span className='action merge-anction' onClick={e => {
              e.stopPropagation()
              this.mergeSelectedInside(e)
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
                      this.clickInItem(children)
                    }}
                  >
                    {children.text}
                    {
                      selectedInList.length >= 2 && children.selected && <span className='action merge-anction' onClick={e => {
                        e.stopPropagation()
                        this.mergeSelectedInside(e)
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
  closeMuen = () => {
    this.setState({ showMenu: false })
  }
  clickMenuItem = (e, value) => {
    e.stopPropagation() 
    const { rightCurrent, list } = this.state 
    let index = list.findIndex(item => item.id === rightCurrent.id)
    rightCurrent.sortNum = value
    if (index !== -1) {
      list[index] = rightCurrent
      this.setState({ list })
      this.closeMuen()
      return;
    }
    let parent = findById(list, rightCurrent.parentId) 
    updateList(list, parent)
    this.setState({ list })
    this.closeMuen()
  }
  onChange = (e) => {  
    this.setState({
      originStr: e.target.value
    }, this.initList) 
  }
  reset = () => {
    this.setState({
      originStr: ''
    }, this.initList)
  }
  render() {
    const { list, result, desc, showModal, showMenu, pageX, pageY, rightCurrent, selectedList, originStr } = this.state

    return (
      <div className='demo'>
        <div className='top'>
          <input name="words" id="words" value={originStr} onChange={this.onChange} placeholder='请输入初始化数据' />
          <button onClick={() => this.initList()}>初始化数据</button>
          <button onClick={() => this.reset()}>清空</button>
        </div>
        <div className="list" ref={e => this.domList = e}>
          {
            list.map((item, index) => (
              <div
                key={item.id}
                selfid={item.id}
                className={`item ${!item.format && item.selected ? 'selected' : 'item-in'}`} 
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault();
                  this.clickItem(item)
                }}
                onDoubleClick={e => {
                  e.stopPropagation() 
                  if (item.format) {
                    this.clickSplit(e, item)
                  }
                }}
                onContextMenu={e => {
                  e.stopPropagation()
                  this.onContextMenu(e, item)
                }}
              > 
                {
                  this.renderDOM(item)
                }
                {
                  item.selected && selectedList.length !== 0 && <span className='action merge-anction' onClick={e => {
                    e.stopPropagation()
                    this.mergeSelected(e)
                  }}>合并</span>
                } 
              </div>
            ))
          }
        </div>
        <div className="action-btns">
          <span className='btn' onClick={() => this.format()}>格式化数据</span>
          <span className='btn copy' onClick={() => this.copy()} data-clipboard-text={JSON.stringify(result, (k, v) => v, 4)}>拷贝</span>
        </div>
        <div className='content'>
          <pre>
            {JSON.stringify(result, (k, v) => v, 4)}
          </pre>
        </div>
        {
          showModal && (
            <div className='modal'>
              <span>{desc}</span>
            </div>
          )
        }
        {
          showMenu && (
            <div className='right' style={{ top: pageY + 5, left: pageX + 5 }}>
              <div className={`right-item ${rightCurrent.sortNum == 1 ? 'right-item-selected' : ''}`} onClick={e => this.clickMenuItem(e, 1)}>有序</div>
              <div className={`right-item ${rightCurrent.sortNum == 0 ? 'right-item-selected' : ''}`} onClick={e => this.clickMenuItem(e, 0)}>无序</div>
            </div>
          )
        }
      </div>
    );
  }
}

export default Demo;