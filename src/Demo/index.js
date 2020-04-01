import React, { Component } from 'react';
import './index.scss'
import ClipboardJS from "clipboard";
import $ from 'jquery'

function select(o, fn) {
  window.targetStart = document
  o.onmousedown = function (e) {
    var event = window.event || e;
    var target1 = event.srcElement ? event.srcElement : event.target;
    window.targetStart = target1
  }
  o.onmouseup = function (e) {
    var event = window.event || e;
    var target = event.srcElement ? event.srcElement : event.target;
    var sText = document.selection == undefined ? document.getSelection().toString() : document.selection.createRange().text;
    if (sText != "") {
      //将参数传入回调函数fn
      fn(sText, target);
    }

  }
}
Array.prototype.update = function (index, updateObj) {
  this[index] = updateObj
  console.log(26)
  return this;
}

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          id: 0,
          text: '向',
          zIndex: 0,
        },
        {
          id: 1,
          text: '我',
          zIndex: 0,
        },
        {
          id: 2,
          text: '你',
          zIndex: 0,
        },
        {
          id: 3,
          text: '他',
          zIndex: 0,
        },
        {
          id: 4,
          text: '小',
          zIndex: 0,
        },
        {
          id: 5,
          text: '飞',
          zIndex: 0,
        },
        {
          id: 6,
          text: '李',
          zIndex: 0,
        },
        {
          id: 7,
          text: '王',
          zIndex: 0,
        },
        {
          id: 8,
          text: '二',
          zIndex: 0,
        },
        {
          id: 9,
          text: '张',
          zIndex: 0,
        },
        {
          id: 11,
          text: '赵',
          zIndex: 0,
        },
        {
          id: 12,
          text: '马',
          zIndex: 0,
        },
        {
          id: 13,
          text: '王',
          zIndex: 0,
        },
        {
          id: 14,
          text: '晓',
          zIndex: 0,
        },
        {
          id: 15,
          text: '三',
          zIndex: 0,
        },
        {
          id: 16,
          text: '二',
          zIndex: 0,
        },
        {
          id: 17,
          text: '五',
          zIndex: 0,
        },
        {
          id: 18,
          text: '六',
          zIndex: 0,
        },
      ],
      selectedList: [], // 选中的列表
      result: {}, // 格式化的数据 
      desc: '',
      showModal: false
    }
  }
  timer = null
  componentDidMount() {
    select(document, this.selectText);
    this.clipboard = new ClipboardJS('.copy');
    this.clipboard.on('success', (e) => {
      this.openModal('拷贝成功')
      e.clearSelection();

    });
    this.clipboard.on('error', (e) => {
      this.openModal('拷贝失败')
    });
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
  selectText = (txt, tar) => {
    let startItem = $(window.targetStart).parents('.merge').last()
    let endItem = $(tar).parents('.merge').last()
    startItem = startItem.length ? startItem.prevObject[0] : startItem.prevObject.prevObject[0]
    endItem = endItem.length ? endItem.prevObject[0] : endItem.prevObject.prevObject[0]
    let { list } = this.state
    list = list.filter(item => item.id >= $(startItem).attr('selfid') && item.id <= $(endItem).attr('selfid'))
    list.map(this.clickItem)
    this.mergeSelected()
  }
  clickItem = (item) => {
    let { list } = this.state
    if (list.length === 1) return;
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
    if (selectedList.length >= 2) {
      let mergeObj = this.merge(selectedList)
      list = this.replace(list, mergeObj) 
      list = this.delelteItem(list, mergeObj)
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

  // 双击拆分内层
  onDoubleClick = (e) => {
    e.stopPropagation()
    const { list } = this.state
    console.log(e.target.classList);
    let splitId = $(e.target).parent('.merge').attr('selfid') * 1 || $(e.target).attr('selfid') * 1;
    console.log($(e.target).parent('.merge'));
    console.log('splitId', splitId)

    let zIndex = ($(e.target).attr('zindex') || $(e.target).parent('.merge').attr('zindex')) * 1
    console.log('zIndex', zIndex);

    let id = $(e.target).parents('.item').last().attr('selfid') * 1
    console.log('id',id);

    let prev = list.find(item => item.id === id)
    console.log(0, prev);
    if (prev.id === splitId) {
      this.clickSplit(null, prev)
      return;
    } 
    console.log(list)
    return ;
    let wrapIndex = list.findIndex(item => item.id === id)

    let parentArr = [prev]
    const run = (arr = [], zIndex, res = []) => {
      if (!arr.length) return arr;
      let filters = arr.filter(item => item.zIndex === zIndex)
      if (filters.length) {
        return res.concat(...filters)
      } else {
        res = arr.map(item => {
          if (item.format) {
            return run(item.format, zIndex, res)
          }
          return [];
        })
        return res;
      }
    }
    if (prev.zIndex !== zIndex + 1) {
      parentArr = run(prev.format, zIndex + 1, [])
    }
    parentArr = parentArr.flat(Infinity)
    let parent = parentArr[0]

    // 合并parent 插入原list 更新
    let newParent = this.splitCore(parent, splitId)
    console.log(258, JSON.parse(JSON.stringify(newParent)));
    let a = null
    const eachTree = (list) => {
      list.map((item, index) => {
        if (item.zIndex === newParent.zIndex && item.id === newParent.id) {
          console.log(262, JSON.parse(JSON.stringify(list[index])));
          // list[index] = newParent 
          list.update(index, newParent)
          console.log('---------a-----', JSON.parse(JSON.stringify(a)));
          // a.content.selectedList.splice(index, 1, newParent) 
          // a = list
          // if (!a) {
          //   list[index] = newParent
          // } else {
          //   a[index] = newParent
          //   console.log('---------a-----', JSON.parse(JSON.stringify(a)));
          // }
          // console.log(264, JSON.parse(JSON.stringify(list[index])));
        } else {
          if (item.format) {
            a = item
            eachTree(item.format)
          }
        }
      })
    }
    eachTree(list)
    console.log(304, JSON.parse(JSON.stringify(list)))
    setTimeout(() => {
      let b = JSON.parse(JSON.stringify(list))
      console.log(307, b);
      // this.setState({list: b})
    }, 1000)


    // const findIndex = (prevFormat = [], parent = {}, allIndex = []) => {
    //   allIndex = prevFormat.map((item, index, orignArray) => {
    //     if (item.id === parent.id) {
    //       allIndex = allIndex.concat([index])
    //       if (item.zIndex === parent.zIndex) {
    //         // console.log('prevFormat', JSON.parse(JSON.stringify(orignArray[index])));
    //         // orignArray[index] = newParent 
    //         // console.log('newParent', newParent); 
    //         return allIndex;
    //       } else {
    //         return allIndex.concat(findIndex(item.format, parent, allIndex))
    //       }
    //     } else {
    //       if (item.format) {
    //         return allIndex.concat(findIndex(item.format, parent, allIndex))
    //       }
    //       return allIndex;
    //     }
    //   })
    //   return allIndex;
    // }

    // let allIndex = []
    // if (prev.format && prev.zIndex !== newParent.zIndex) {
    //   allIndex = findIndex(prev.format, parent, allIndex)
    // }
    // allIndex = allIndex.flat(Infinity)

    // console.log(9999, allIndex);



    // if (allIndex.length) {
    //   console.log(222);
    //   list[wrapIndex] = prev
    //   console.log(list[wrapIndex]);
    // } else {
    //   list[wrapIndex] = newParent
    // }
    // console.log(allIndex);
    // console.log(666, prev);
    // console.log(b);
    // this.setState({ list: b }, () => {
    //   console.log(8888888, this.state.list);
    // })
    // setTimeout(() => {
    //   this.setState({list: [...list]})
    // }, 5000)
  }
  // 合并
  merge = (selectedList) => {
    let len = selectedList.length
    let zIndexes = selectedList.map(item => item.zIndex || 0)
    let zIndex = Math.max(...zIndexes) + 1;
    let id = Date.now()

    let res = {
      id,
      format: [...selectedList],
      selected: false,
      isMerged: true,
      zIndex,
      text: (
        <div className='merge' selfid={id} zindex={zIndex} onDoubleClick={this.onDoubleClick}>
          {
            selectedList.map((item, index) => {
              return (
                <div className='item' id={item.id} key={item.id} >{item.text}</div>
              )
            })
          }
        </div>
      ),
      content: {
        className: 'merge',
        selfid: id,
        zIndex: zIndex,
        onDoubleClick: this.onDoubleClick,
        selectedList,
      },
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
      let index = list.findIndex(item => item.id === mergeObj.right.id)
      if (index !== -1) {
        list.splice(index, 1)
      }
    } 
    return list;
  }
  // 双击拆分内层 合并parent
  splitCore = (parent, splitId) => {
    parent.update && parent.update()
    console.log(parent)
    let newParent = JSON.parse(JSON.stringify(parent))
    let index = parent.format.findIndex(item => item.id === splitId)
    console.log(index);
    let splitObj = JSON.parse(JSON.stringify(parent.format[index]))
    console.log(444, splitObj);

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

    // let a = JSON.parse(JSON.stringify(newParent)) 
    // newParent.content.zIndex = newParent.content.zIndex - 1
    // newParent.zIndex = newParent.zIndex - 1
    newParent.content.selectedList.splice(index, 1, ...splitObj.content.selectedList)

    console.log(55555, newParent);
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
    result.map(item => {
      item = this.deleteKey(item)
      return item
    })
    if (result.length === 1) {
      result = result.pop()
    } else {
      result = {
        disorder: false,
        list: [...result]
      }
    }
    return result;
  }
  // 点击格式化
  format = () => {
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
    delete item.hovered
    delete item.left
    delete item.right
    delete item.content
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
    console.log(result);
  }
  renderDOM = (item) => {
    // if (typeof item.text == 'string') return item.text
    // const run = (content) => {
    //   return <div key={content.selfid} className={content.className} selfid={content.selfid} zindex={content.zIndex} onDoubleClick={content.onDoubleClick}>
    //     {
    //       content.selectedList && content.selectedList.map(selected => {
    //         if (selected.content && selected.content.selectedList.length) {
    //           return run(selected.content)
    //         } else {
    //           return (
    //             <div
    //               key={selected.id}
    //               selfid={selected.id}
    //               className={`item`}
    //               onClick={() => this.clickItem(selected)}
    //             >{selected.text}</div>
    //           )
    //         }
    //       })
    //     }
    //   </div>
    // } 
    // let res = run(item.content);

    if (typeof item.text == 'string') return item.text
    const run = (selectedList) => {
      return <div key={item.content.selfid} className={item.content.className} selfid={item.content.selfid} zindex={item.content.zIndex} onDoubleClick={this.onDoubleClick}>
        {
          selectedList.map(selected => {
            if (selected.selectedList && selected.selectedList.length) {
              return run(selected.selectedList)
            } else {
              return (
                <div
                  key={selected.id}
                  selfid={selected.id}
                  className={`item`}
                  onClick={() => this.clickItem(selected)}
                >{selected.text}</div>
              )
            }
          })
        }
      </div>
    }
    let res = run(item.content.selectedList);
    // console.log(res);
    return res
  }
  render() {
    const { list, selectedList, result, desc, showModal } = this.state
    const selectedLen = selectedList.length
    // console.log(999, list);

    return (
      <div className='demo'>
        <div className="list">
          {
            list.map((item, index) => (
              <div
                key={item.id}
                selfid={item.id}
                className={`item ${item.selected ? 'selected' : ''}`}
                onMouseOver={() => this.onMouseOver(item)}
                onMouseEnter={() => this.onMouseEnter(item)}
                onMouseLeave={() => this.onMouseLeave(item)}
                onClick={() => this.clickItem(item)}
              >
                {
                  item.text
                }
                {
                  // this.renderDOM(item)
                }
                {
                  selectedLen >= 2 && item.selected && <span className='action merge-anction' onClick={e => this.mergeSelected(e)}>合并</span>
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

      </div>
    );
  }
}

export default Demo;