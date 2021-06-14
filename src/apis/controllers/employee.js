const User = require("../models/user");
const mongoose = require('mongoose')
const Storage = require("../models/storage")
const Error = require("../utils/error");
const ActivityLog = require('../models/activityLog')

module.exports.getAllEmployee = async (req, res) => {
    const routeType = 'config.read';
    const { user } = req
    const { storageId, roleAccess } = user.currentStorage

    if(true) {
        try {
            const employees = await User.find({
                'storages.storage.storageId': storageId
            })

            return res.status(200).send(employees.map(i => {
                const matchedStorage = i.storages.find(el => el.storage.storageId.equals(storageId)).storage

                return ({
                    userId: i._id,
                    displayName: i.displayName,
                    role: matchedStorage.role,
                    roleAccess: matchedStorage.roleAccess,
                    lastSeen: i.lastSeen
                })
            }))
        } catch (e) {
            console.log(e.message)
            return res.status(500).send(Error({ message: 'Lấy danh sách nhân viên thất bại!' }))
        }
    } else { 
        return res.status(403).send(Error({ message: 'Không có quyền truy cập!' }))
    }
};

module.exports.inviteEmployee = async (req, res) => {
    const { email, roleAccess } = req.body

    if(email === req.user.email || email === '') {
        return res.status(400).send(Error({ message: 'Email không hợp lệ!'}))
    }

    try {
        const matchedUser = await User.findOne({ email })
        
        if(!matchedUser) {
            return res.status(400).send(Error({ message: 'Địa chỉ mail không tồn tại !'}))
        }

        const duplicatePending = matchedUser.pendingRequest.find(i => i.userId.equals(req.user._id))
        const existedStaff = matchedUser.storages.find(i => req.user.currentStorage.storageId.equals(i.storage.storageId))
        if(duplicatePending) {
            return res.status(409).send(Error({ message: 'Lời mời đến người dùng này đã tồn tại !'}))
        } else if (existedStaff) {
            return res.status(403).send(Error({ message: 'Người dùng đã là nhân viên của cửa hàng !'}))
        } else {
            await User.findOneAndUpdate({ _id: matchedUser._id }, {
                pendingRequest: [...matchedUser.pendingRequest, {
                    userId: req.user._id,
                    displayName: req.user.displayName,
                    storageId: req.user.currentStorage.storageId,
                    storageName: req.user.currentStorage.storageName,
                    role: 'Nhân viên',
                    roleAccess
                }]
            })
        }

        return res.status(200).send("Ok")
    } catch(e) {

    }
}

module.exports.inviteResponse = async (req, res) => {
    const { message, storageId } = req.body

    try {
        if(message === 'reject') {
            await User.findOneAndUpdate({ _id: req.user._id }, { 
                pendingRequest: req.user.pendingRequest.filter(i => !i.storageId.equals(storageId))
            })
            return res.status(200).send("Ok")
        } else if(message === 'resolve') {
            await User.findOneAndUpdate({
                _id: req.user._id
            },{ 
                storages: [...req.user.storages, { storage: {
                    ...req.body,
                    userId: req.user._id
                }}],
                pendingRequest: req.user.pendingRequest.filter(i => !i.storageId.equals(storageId))
            })
    
            return res.status(200).send("Ok")
        }
    } catch(e) {
        return res.status(400).send(Error({ message: 'Không thể xác thực lời mời. Vui lòng thử lại sau!'}))
    }
}

module.exports.deleteEmployee = async (req, res) => {
    const { id } = req.params
    const { storageId } = req.user.currentStorage

    try {
        const matchedUser = await User.findOne({ _id: id })

        await User.findOneAndUpdate({ _id: id }, {
            storages: matchedUser.storages.filter(i => !i.storage.storageId.equals(storageId))
        })

        return res.status(200).send("ok")
    } catch(e) {
        return res.status(500).send(Error({ message: 'Lỗi xảy ra khi xóa nhân viên. Vui lòng thử lại sau!' }))
    }
}