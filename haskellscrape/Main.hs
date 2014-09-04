{-# LANGUAGE ScopedTypeVariables #-}
module Main where

import Data.List
import qualified Data.ByteString.Char8 as BS
import qualified Data.ByteString.UTF8 as UTF
import Network.HTTP
import Control.Monad
import Text.HTML.TagSoup


-- | Avaa urlin ja kaivaa vastauksesta sisällön.
openUrl :: String -> IO String
openUrl url = liftM (UTF.toString . BS.pack) $ request url >>= getResponseBody
    where
        request = simpleHTTP . getRequest

-- | Kerää nettisivulta kaikki linkit, joiden href alkaa
--   merkkijonolla "tuotteet".
scrapeCategoryLinkHrefs :: String -- ^ Kategoriasivun URL
                        -> IO [String]
scrapeCategoryLinkHrefs url = do
    tags <- fmap parseTags $ openUrl url
    return . map getHref $ filter link tags
    where
        -- Ottaa tagista hrefin arvon talteen
        getHref :: Tag String -> String
        getHref tag
            | isTagOpen tag = fromAttrib "href" tag
            | otherwise     = ""

        -- Palauttaa True, jos tagi on linkki ja sen hrefin alussa on "tuotteet"
        link :: Tag String -> Bool
        link (TagOpen "a" attr) = any ("tuotteet" `isPrefixOf`) $ map snd attr
        link _                  = False


-- | Kerää tuotesivulta tuotteiden nimet.
scrapeProductNames :: String -- ^ Tuotesivun URL
                   -> IO [String]
scrapeProductNames productPageUrl = do
    putStrLn $ "Scraping " ++ productPageUrl
    tags <- fmap parseTags $ openUrl productPageUrl
    let productTags = sections (~== "<div class=product-text>") tags
    return $ map (fromTagText . flip (!!) 3) productTags


-- | Kerää tuotenimet scrape.txt tiedostoon.
main :: IO ()
main = do
    categoryUrls <- (fmap . map) (baseUrl ++) (scrapeCategoryLinkHrefs testUrl)
    productNames <- fmap concat $ mapM scrapeProductNames categoryUrls
    BS.writeFile "scrape.txt" . UTF.fromString $ intercalate "\n" productNames
    where
        testUrl =  "http://www.rainbow.fi/rainbow-tuotteet/selaa-tuotteita/"
        baseUrl = "http://www.rainbow.fi/"
