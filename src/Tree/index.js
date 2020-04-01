import React, { Component } from 'react'
import { Tree } from 'antd';

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
    const preKey = _preKey || '0';
    const tns = _tns || gData;

    const children = [];
    for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({ title: key, key });
        if (i < y) {
            children.push(key);
        }
    }
    if (_level < 0) {
        return tns;
    }
    const level = _level - 1;
    children.forEach((key, index) => {
        tns[index].children = [];
        return generateData(level, key, tns[index].children);
    });
};
generateData(z);

class TreeWrap extends React.Component {
    state = {
        gData,
        list: [
            {
                "key": 0,
                "title": "向"
            },
            {
                "key": 1,
                "title": "我"
            },
            {
                "key": 2,
                "title": "你"
            },
            {
                "key": 3,
                "title": "他"
            },
            {
                "key": 4,
                "title": "小"
            },
            {
                "key": 5,
                "title": "飞"
            },
            {
                "key": 6,
                "title": "李"
            },
            {
                "key": 7,
                "title": "王"
            },
            {
                "key": 8,
                "title": "二"
            },
            {
                "key": 9,
                "title": "张"
            },
            {
                "key": 11,
                "title": "赵"
            },
            {
                "key": 12,
                "title": "马"
            },
            {
                "key": 13,
                "title": "王"
            },
            {
                "key": 14,
                "title": "晓"
            },
            {
                "key": 15,
                "title": "三"
            },
            {
                "key": 16,
                "title": "二"
            },
            {
                "key": 17,
                "title": "五"
            },
            {
                "key": 18,
                "title": "六",
                children: [
                    {
                        "key": 20,
                        "title": "二"
                    },
                    {
                        "key": 21,
                        "title": "五"
                    },
                ]
            } 
        ],
        expandedKeys: ['0-0', '0-0-0', '0-0-0-0'],
    };

    onDragEnter = info => {
        console.log(info);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    onDrop = info => {
        console.log(info);
        // const dropKey = info.node.props.eventKey;
        // const dragKey = info.dragNode.props.eventKey;
        // const dropPos = info.node.props.pos.split('-');
        // const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        // const loop = (data, key, callback) => {
        //     data.forEach((item, index, arr) => {
        //         if (item.key === key) {
        //             return callback(item, index, arr);
        //         }
        //         if (item.children) {
        //             return loop(item.children, key, callback);
        //         }
        //     });
        // };
        // const data = [...this.state.gData];

        // // Find dragObject
        // let dragObj;
        // loop(data, dragKey, (item, index, arr) => {
        //     arr.splice(index, 1);
        //     dragObj = item;
        // });

        // if (!info.dropToGap) {
        //     // Drop on the content
        //     loop(data, dropKey, item => {
        //         item.children = item.children || [];
        //         // where to insert 示例添加到尾部，可以是随意位置
        //         item.children.push(dragObj);
        //     });
        // } else if (
        //     (info.node.props.children || []).length > 0 && // Has children
        //     info.node.props.expanded && // Is expanded
        //     dropPosition === 1 // On the bottom gap
        // ) {
        //     loop(data, dropKey, item => {
        //         item.children = item.children || [];
        //         // where to insert 示例添加到头部，可以是随意位置
        //         item.children.unshift(dragObj);
        //     });
        // } else {
        //     let ar;
        //     let i;
        //     loop(data, dropKey, (item, index, arr) => {
        //         ar = arr;
        //         i = index;
        //     });
        //     if (dropPosition === -1) {
        //         ar.splice(i, 0, dragObj);
        //     } else {
        //         ar.splice(i + 1, 0, dragObj);
        //     }
        // }

        // this.setState({
        //     gData: data,
        // });
    };

    render() {
        return (
            <div className='treewrap'> 
                <Tree
                    className="draggable-tree"
                    defaultExpandedKeys={this.state.expandedKeys}
                    draggable
                    blockNode
                    autoExpandParent
                    onDragEnter={this.onDragEnter}
                    onDrop={this.onDrop}
                    treeData={this.state.list}
                />
            </div>
        );
    }
}


export default TreeWrap