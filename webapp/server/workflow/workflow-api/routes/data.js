const router = require('express').Router()
const { getReflist } = require('../controllers/data-controller')

/**
 * @swagger
 * /api/workflow/data/reflist:
 *   get:
 *     summary: Ref list
 *     tags: [Metag]
 *     responses:
 *       200:
 *         description: Action successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionSuccessful'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/actionFailed'
 *       500:
 *         description: API server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/models/serverError'
 */
router.get('/reflist', async (req, res) => {
  await getReflist(req, res)
})

module.exports = router
